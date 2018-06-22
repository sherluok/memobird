/* eslint-disable class-methods-use-this, newline-per-chained-call */
/* eslint-disable no-await-in-loop, no-restricted-syntax */

const fs = require('fs');
const gm = require('gm');
const moment = require('moment');
const request = require('request');
const iconv = require('iconv-lite');
const Bmp = require('binary-bmp');
const config = require('./config');

class Memobird {
  static async sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  // Memobird Required Text Format
  static formatText(base64) {
    return `T:${base64}`;
  }

  // Memobird Required Picture Format
  static formatImage(base64) {
    return `P:${base64}`;
  }

  // download remote image with a url
  static getImageDataFromUrl(url) {
    return new Promise((resolve, reject) => {
      request(url, { encoding: null }, (error, response = {}, bodyBuffer) => {
        if (error || response.statusCode !== 200) {
          reject({ error, response });
        } else {
          resolve(bodyBuffer);
        }
      });
    });
  }

  // convert image format using gm
  static localImageConversion(data, width) {
    return new Promise((resolve, reject) => {
      gm(data).resize(width || 384).flip().type('Bilevel').colors(2).toBuffer('bmp', (error, buffer) => {
        if (error) {
          reject(error);
        } else {
          resolve(buffer.toString('base64'));
        }
      });
    });
  }

  constructor(options = {}) {
    this.ak = options.ak;
    this.memobirdID = options.memobirdID;
    this.useridentifying = options.useridentifying;
  }

  get timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  // api请求
  // api request
  post(type, body) {
    return new Promise((resolve, reject) => {
      request.post({
        url: config.api[type],
        form: Object.assign({}, {
          ak: this.ak,
          timestamp: this.timestamp,
          memobirdID: this.memobirdID,
        }, body),
      }, (error, response = {}, body) => {
        if (error || response.statusCode !== 200) {
          reject({ error, response });
        } else {
          try {
            const data = JSON.parse(body);
            const { showapi_res_code, showapi_res_error } = data;
            if (showapi_res_code !== 1) {
              reject({ showapi_res_code, showapi_res_error });
            } else {
              resolve(data);
            }
          } catch(error) {
            reject({ error });
          }
        }
      });
    });
  }

  // 账号关联
  // user bind
  async init() {
    if (this.inited) return;
    const { showapi_userid } = await this.post('bind', { useridentifying: this.useridentifying });
    this.userID = showapi_userid;
    this.inited = true;
  }

  // 获取纸条打印状态
  // get print status
  async getPrintStatus(printcontentid) {
    const { printflag } = await this.post('watch', { printcontentid });
    return printflag;
  }

  // 延时一定时间后获取咕咕机打印状态
  // get print status after a while
  async glance(printcontentid, delay = 1000) {
    await Memobird.sleep(delay);
    const printflag = await this.getPrintStatus(printcontentid);
    return printflag;
  }

  // 监听打印状态
  // keep getting print status until printed or timeout
  async watch(printcontentid, delay = 3000, maxDelay = 15000) {
    let printflag = 0;
    let totalDelay = 0;
    while (printflag !== 1 && totalDelay < maxDelay) {
      await Memobird.sleep(delay);
      printflag = await this.getPrintStatus(printcontentid);
      totalDelay += delay;
    }
    return printflag;
  }

  // 纸条打印
  // print paper
  async print(...items) {
    // 参数不仅可以是字符串，还可以是未完成的encode操作生成的promise
    // items can be not only base64 text data,
    // but also promise that will return a base64 text data
    const printcontents = [];
    for (const item of items) {
      if (typeof item.then === 'function') {
        printcontents.push(await item);
      } else {
        printcontents.push(item);
      }
    }
    const printcontent = printcontents.join('|');
    const { printcontentid } = await this.post('print', { userID: this.userID, printcontent });
    return printcontentid;
  }

  // 打印文字
  async printText(text) {
    const printcontentid = await this.print(this.encodeText(text));
    return printcontentid;
  }
  encodeText(text) {
    return Memobird.formatText(iconv.encode(`${text}\n`, 'gbk').toString('base64'));
  }

  // 打印 Canvas
  async printCanvas(canvas) {
    const printcontentid = await this.print(this.encodeCanvas(canvas));
    return printcontentid;
  }
  encodeCanvas(canvas) {
    const binary = new Bmp(Bmp.BINARY, canvas);
    return Memobird.formatImage(binary.getBase64(true));
  }

  // 打印图片
  async printImage(image, width) {
    const printcontentid = await this.print(await this.encodeImage(image, width));
    return printcontentid;
  }
  // convert jpeg or png image into signal color bmp image through Memobird's api
  async remoteImageConversion(imgBase64String) {
    const { result: signalColorBmpBase64Data } = await this.post('image', { imgBase64String });
    return signalColorBmpBase64Data;
  }
  encodeImage(image, width) {
    return width ? this.encodeImageLocally(image, width) : this.encodeImageRemotely(image);
  }
  // use Memobird's api to convert image format
  async encodeImageRemotely(image) {
    let base64Data;
    if (/^data:image\/\w+;base64,/.test(image)) {
      // image is a jpeg or png format picture's base64 data
      base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    } else if (image.indexOf('http://') === -1 && image.indexOf('https://') === -1) {
      // image is a path of local picture
      base64Data = fs.readFileSync(image).toString('base64');
    } else {
      // image is a url of remote picture
      const bodyBuffer = await Memobird.getImageDataFromUrl(image);
      base64Data = bodyBuffer.toString('base64');
    }
    const signalColorBmpBase64Data = await this.remoteImageConversion(base64Data);
    return Memobird.formatImage(signalColorBmpBase64Data);
  }
  // use graphicsmagick to convert image format
  async encodeImageLocally(image, width) {
    let signalColorBmpBase64Data;
    if (/^data:image\/\w+;base64,/.test(image)) {
      // image is a jpeg or png format picture's base64 data
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const dataBuffer = Buffer.from(base64Data, 'base64');
      signalColorBmpBase64Data = await Memobird.localImageConversion(dataBuffer, width);
    } else if (image.indexOf('http://') === -1 && image.indexOf('https://') === -1) {
      // image is a path of local picture
      fs.accessSync(image, fs.constants.R_OK);
      signalColorBmpBase64Data = await Memobird.localImageConversion(image, width);
    } else {
      // image is a url of remote picture
      const bodyBuffer = await Memobird.getImageDataFromUrl(image);
      signalColorBmpBase64Data = await Memobird.localImageConversion(bodyBuffer, width);
    }
    return Memobird.formatImage(signalColorBmpBase64Data);
  }

  async printUrl(printUrl) {
    const { printcontentid } = await this.post('url', { userID: this.userID, printUrl });
    return printcontentid;
  }

  async printHtml(printHtmlString) {
    const printHtml = iconv.encode(printHtmlString, 'gbk').toString('base64');
    const { printcontentid } = await this.post('html', { userID: this.userID, printHtml });
    return printcontentid;
  }
}

module.exports = Memobird;
