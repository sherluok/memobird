'use strict';

const fs = require('fs');
const gm = require('gm');
const moment = require('moment');
const request = require('request');
const iconv = require('iconv-lite');
const Bmp = require('binary-bmp');
const config = require('./config');

class Memobird {
  static async sleep(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time);
    });
  }

  constructor(config = {}) {
    this.ak = config.ak;
    this.memobirdID = config.memobirdID;
    this.useridentifying = config.useridentifying;
  }

  get timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }

  // api请求
  post(type, body) {
    return new Promise((resolve, reject) => {
      request.post({
        url: config.api[type],
        form: Object.assign({}, {
          ak: this.ak,
          timestamp: this.timestamp,
          memobirdID: this.memobirdID,
        }, body),
      }, (error, response, body) => {
        const { statusCode } = response;
        try {
          const data = JSON.parse(body);
          const { showapi_res_code, showapi_res_error } = data;
          if (error || statusCode !== 200 || showapi_res_code !== 1) {
            reject({ error, statusCode, showapi_res_code, showapi_res_error });
          } else {
            resolve(data);
          }
        } catch (error) {
          reject({ error });
        }
      });
    });
  }

  // 账号关联
  async init() {
    if (!this.inited) {
      const { showapi_userid } = await this.post('bind', { useridentifying: this.useridentifying });
      this.userID = showapi_userid;
      this.inited = true;
    }
  }

  // 获取纸条打印状态
  async getPrintStatus(printcontentid) {
    const { printflag } = await this.post('watch', { printcontentid });
    return printflag;
  }
  // 延时一定时间后获取咕咕机打印状态
  async glance(printcontentid, delay = 1000) {
    await Memobird.sleep(delay);
    return await this.getPrintStatus(printcontentid);
  }
  // 监听打印状态
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
  async print(...items) {
    // 参数不仅可以是字符串，还可以是未完成的encode操作生成的promise
    const printcontents = [];
    for (let item of items) {
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
    return await this.print(Memobird.encodeText(text));
  }
  static encodeText(text) {
    return `T:${iconv.encode(`${text}\n`, 'gbk').toString('base64')}`;
  }

  // 打印Canvas
  async printCanvas(canvas) {
    return await this.print(Memobird.encodeCanvas(canvas));
  }
  static encodeCanvas(canvas) {
    const binary = new Bmp(Bmp.BINARY, canvas);
    return `P:${binary.getBase64(true)}`;
  }

  // 根据图片路径打印
  async printImage(imagePath, width) {
    return await this.print(await Memobird.encodeImage(imagePath, width));
  }
  static encodeImage(imagePath, width) {
    return new Promise(function(resolve, reject) {
      // 处理图片
      function data2base64(data) {
        gm(data).resize(width || 384).flip().type('Bilevel').colors(2).toBuffer('bmp', (error, buffer) => {
          if (error) {
            reject(error);
          } else {
            resolve(`P:${buffer.toString('base64')}`);
          }
        });
      }
      // 获取图片
      if (/^data:image\/\w+;base64,/.test(imagePath)) {
        // base64格式的图片
        const base64Data = imagePath.replace(/^data:image\/\w+;base64,/, '');
        const dataBuffer = new Buffer(base64Data, 'base64');
        data2base64(dataBuffer);
      } else if (imagePath.indexOf('http://') === -1 && imagePath.indexOf('https://') === -1) {
        // 从本地路径获取
        try {
          fs.readFileSync(imagePath);
          data2base64(imagePath);
        } catch (error) {
          reject(error);
        }
      } else {
        // 从网络路径获取
        request(imagePath, { encoding: null }, (error, response, bodyBuffer) => {
          if (error) {
            reject(error);
          } else {
            data2base64(bodyBuffer);
          }
        });
      }
    });
  }
}

module.exports = Memobird;
