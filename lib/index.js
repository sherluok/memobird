'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable class-methods-use-this, newline-per-chained-call */
/* eslint-disable no-await-in-loop, no-restricted-syntax */

var fs = require('fs');
var gm = require('gm');
var moment = require('moment');
var request = require('request');
var iconv = require('iconv-lite');
var Bmp = require('binary-bmp');
var config = require('./config');

var Memobird = function () {
  (0, _createClass3.default)(Memobird, null, [{
    key: 'sleep',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(time) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', new _promise2.default(function (resolve) {
                  return setTimeout(resolve, time);
                }));

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function sleep(_x) {
        return _ref.apply(this, arguments);
      }

      return sleep;
    }()

    // Memobird Required Text Format

  }, {
    key: 'formatText',
    value: function formatText(base64) {
      return 'T:' + base64;
    }

    // Memobird Required Picture Format

  }, {
    key: 'formatImage',
    value: function formatImage(base64) {
      return 'P:' + base64;
    }

    // download remote image with a url

  }, {
    key: 'getImageDataFromUrl',
    value: function getImageDataFromUrl(url) {
      return new _promise2.default(function (resolve, reject) {
        request(url, { encoding: null }, function (error) {
          var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var bodyBuffer = arguments[2];

          if (error || response.statusCode !== 200) {
            reject({ error: error, response: response });
          } else {
            resolve(bodyBuffer);
          }
        });
      });
    }

    // convert image format using gm

  }, {
    key: 'localImageConversion',
    value: function localImageConversion(data, width) {
      return new _promise2.default(function (resolve, reject) {
        gm(data).resize(width || 384).flip().type('Bilevel').colors(2).toBuffer('bmp', function (error, buffer) {
          if (error) {
            reject(error);
          } else {
            resolve(buffer.toString('base64'));
          }
        });
      });
    }
  }]);

  function Memobird() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Memobird);

    this.ak = options.ak;
    this.memobirdID = options.memobirdID;
    this.useridentifying = options.useridentifying;
  }

  (0, _createClass3.default)(Memobird, [{
    key: 'post',


    // api请求
    // api request
    value: function post(type, body) {
      var _this = this;

      return new _promise2.default(function (resolve, reject) {
        request.post({
          url: config.api[type],
          form: (0, _assign2.default)({}, {
            ak: _this.ak,
            timestamp: _this.timestamp,
            memobirdID: _this.memobirdID
          }, body)
        }, function (error) {
          var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var body = arguments[2];

          if (error || response.statusCode !== 200) {
            reject({ error: error, response: response });
          } else {
            try {
              var data = JSON.parse(body);
              var showapi_res_code = data.showapi_res_code,
                  showapi_res_error = data.showapi_res_error;

              if (showapi_res_code !== 1) {
                reject({ showapi_res_code: showapi_res_code, showapi_res_error: showapi_res_error });
              } else {
                resolve(data);
              }
            } catch (error) {
              reject({ error: error });
            }
          }
        });
      });
    }

    // 账号关联
    // user bind

  }, {
    key: 'init',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var _ref3, showapi_userid;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.inited) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt('return');

              case 2:
                _context2.next = 4;
                return this.post('bind', { useridentifying: this.useridentifying });

              case 4:
                _ref3 = _context2.sent;
                showapi_userid = _ref3.showapi_userid;

                this.userID = showapi_userid;
                this.inited = true;

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function init() {
        return _ref2.apply(this, arguments);
      }

      return init;
    }()

    // 获取纸条打印状态
    // get print status

  }, {
    key: 'getPrintStatus',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(printcontentid) {
        var _ref5, printflag;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.post('watch', { printcontentid: printcontentid });

              case 2:
                _ref5 = _context3.sent;
                printflag = _ref5.printflag;
                return _context3.abrupt('return', printflag);

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getPrintStatus(_x5) {
        return _ref4.apply(this, arguments);
      }

      return getPrintStatus;
    }()

    // 延时一定时间后获取咕咕机打印状态
    // get print status after a while

  }, {
    key: 'glance',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(printcontentid) {
        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var printflag;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return Memobird.sleep(delay);

              case 2:
                _context4.next = 4;
                return this.getPrintStatus(printcontentid);

              case 4:
                printflag = _context4.sent;
                return _context4.abrupt('return', printflag);

              case 6:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function glance(_x6) {
        return _ref6.apply(this, arguments);
      }

      return glance;
    }()

    // 监听打印状态
    // keep getting print status until printed or timeout

  }, {
    key: 'watch',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(printcontentid) {
        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
        var maxDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 15000;
        var printflag, totalDelay;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                printflag = 0;
                totalDelay = 0;

              case 2:
                if (!(printflag !== 1 && totalDelay < maxDelay)) {
                  _context5.next = 11;
                  break;
                }

                _context5.next = 5;
                return Memobird.sleep(delay);

              case 5:
                _context5.next = 7;
                return this.getPrintStatus(printcontentid);

              case 7:
                printflag = _context5.sent;

                totalDelay += delay;
                _context5.next = 2;
                break;

              case 11:
                return _context5.abrupt('return', printflag);

              case 12:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function watch(_x8) {
        return _ref7.apply(this, arguments);
      }

      return watch;
    }()

    // 纸条打印
    // print paper

  }, {
    key: 'print',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6() {
        for (var _len = arguments.length, items = Array(_len), _key = 0; _key < _len; _key++) {
          items[_key] = arguments[_key];
        }

        var printcontents, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, item, printcontent, _ref9, printcontentid;

        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                // 参数不仅可以是字符串，还可以是未完成的encode操作生成的promise
                // items can be not only base64 text data,
                // but also promise that will return a base64 text data
                printcontents = [];
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context6.prev = 4;
                _iterator = (0, _getIterator3.default)(items);

              case 6:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context6.next = 20;
                  break;
                }

                item = _step.value;

                if (!(typeof item.then === 'function')) {
                  _context6.next = 16;
                  break;
                }

                _context6.t0 = printcontents;
                _context6.next = 12;
                return item;

              case 12:
                _context6.t1 = _context6.sent;

                _context6.t0.push.call(_context6.t0, _context6.t1);

                _context6.next = 17;
                break;

              case 16:
                printcontents.push(item);

              case 17:
                _iteratorNormalCompletion = true;
                _context6.next = 6;
                break;

              case 20:
                _context6.next = 26;
                break;

              case 22:
                _context6.prev = 22;
                _context6.t2 = _context6['catch'](4);
                _didIteratorError = true;
                _iteratorError = _context6.t2;

              case 26:
                _context6.prev = 26;
                _context6.prev = 27;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 29:
                _context6.prev = 29;

                if (!_didIteratorError) {
                  _context6.next = 32;
                  break;
                }

                throw _iteratorError;

              case 32:
                return _context6.finish(29);

              case 33:
                return _context6.finish(26);

              case 34:
                printcontent = printcontents.join('|');
                _context6.next = 37;
                return this.post('print', { userID: this.userID, printcontent: printcontent });

              case 37:
                _ref9 = _context6.sent;
                printcontentid = _ref9.printcontentid;
                return _context6.abrupt('return', printcontentid);

              case 40:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this, [[4, 22, 26, 34], [27,, 29, 33]]);
      }));

      function print() {
        return _ref8.apply(this, arguments);
      }

      return print;
    }()

    // 打印文字

  }, {
    key: 'printText',
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(text) {
        var printcontentid;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.print(this.encodeText(text));

              case 2:
                printcontentid = _context7.sent;
                return _context7.abrupt('return', printcontentid);

              case 4:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function printText(_x11) {
        return _ref10.apply(this, arguments);
      }

      return printText;
    }()
  }, {
    key: 'encodeText',
    value: function encodeText(text) {
      return Memobird.formatText(iconv.encode(text + '\n', 'gbk').toString('base64'));
    }

    // 打印 Canvas

  }, {
    key: 'printCanvas',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(canvas) {
        var printcontentid;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.print(this.encodeCanvas(canvas));

              case 2:
                printcontentid = _context8.sent;
                return _context8.abrupt('return', printcontentid);

              case 4:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function printCanvas(_x12) {
        return _ref11.apply(this, arguments);
      }

      return printCanvas;
    }()
  }, {
    key: 'encodeCanvas',
    value: function encodeCanvas(canvas) {
      var binary = new Bmp(Bmp.BINARY, canvas);
      return Memobird.formatImage(binary.getBase64(true));
    }

    // 打印图片

  }, {
    key: 'printImage',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(image, width) {
        var printcontentid;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.t0 = this;
                _context9.next = 3;
                return this.encodeImage(image, width);

              case 3:
                _context9.t1 = _context9.sent;
                _context9.next = 6;
                return _context9.t0.print.call(_context9.t0, _context9.t1);

              case 6:
                printcontentid = _context9.sent;
                return _context9.abrupt('return', printcontentid);

              case 8:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function printImage(_x13, _x14) {
        return _ref12.apply(this, arguments);
      }

      return printImage;
    }()
    // convert jpeg or png image into signal color bmp image through Memobird's api

  }, {
    key: 'remoteImageConversion',
    value: function () {
      var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(imgBase64String) {
        var _ref14, signalColorBmpBase64Data;

        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return this.post('image', { imgBase64String: imgBase64String });

              case 2:
                _ref14 = _context10.sent;
                signalColorBmpBase64Data = _ref14.result;
                return _context10.abrupt('return', signalColorBmpBase64Data);

              case 5:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      function remoteImageConversion(_x15) {
        return _ref13.apply(this, arguments);
      }

      return remoteImageConversion;
    }()
  }, {
    key: 'encodeImage',
    value: function encodeImage(image, width) {
      return width ? this.encodeImageLocally(image, width) : this.encodeImageRemotely(image);
    }
    // use Memobird's api to convert image format

  }, {
    key: 'encodeImageRemotely',
    value: function () {
      var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(image) {
        var base64Data, bodyBuffer, signalColorBmpBase64Data;
        return _regenerator2.default.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                base64Data = void 0;

                if (!/^data:image\/\w+;base64,/.test(image)) {
                  _context11.next = 5;
                  break;
                }

                // image is a jpeg or png format picture's base64 data
                base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                _context11.next = 13;
                break;

              case 5:
                if (!(image.indexOf('http://') === -1 && image.indexOf('https://') === -1)) {
                  _context11.next = 9;
                  break;
                }

                // image is a path of local picture
                base64Data = fs.readFileSync(image).toString('base64');
                _context11.next = 13;
                break;

              case 9:
                _context11.next = 11;
                return Memobird.getImageDataFromUrl(image);

              case 11:
                bodyBuffer = _context11.sent;

                base64Data = bodyBuffer.toString('base64');

              case 13:
                _context11.next = 15;
                return this.remoteImageConversion(base64Data);

              case 15:
                signalColorBmpBase64Data = _context11.sent;
                return _context11.abrupt('return', Memobird.formatImage(signalColorBmpBase64Data));

              case 17:
              case 'end':
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));

      function encodeImageRemotely(_x16) {
        return _ref15.apply(this, arguments);
      }

      return encodeImageRemotely;
    }()
    // use graphicsmagick to convert image format

  }, {
    key: 'encodeImageLocally',
    value: function () {
      var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(image, width) {
        var signalColorBmpBase64Data, base64Data, dataBuffer, bodyBuffer;
        return _regenerator2.default.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                signalColorBmpBase64Data = void 0;

                if (!/^data:image\/\w+;base64,/.test(image)) {
                  _context12.next = 9;
                  break;
                }

                // image is a jpeg or png format picture's base64 data
                base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                dataBuffer = Buffer.from(base64Data, 'base64');
                _context12.next = 6;
                return Memobird.localImageConversion(dataBuffer, width);

              case 6:
                signalColorBmpBase64Data = _context12.sent;
                _context12.next = 22;
                break;

              case 9:
                if (!(image.indexOf('http://') === -1 && image.indexOf('https://') === -1)) {
                  _context12.next = 16;
                  break;
                }

                // image is a path of local picture
                fs.accessSync(image, fs.constants.R_OK);
                _context12.next = 13;
                return Memobird.localImageConversion(image, width);

              case 13:
                signalColorBmpBase64Data = _context12.sent;
                _context12.next = 22;
                break;

              case 16:
                _context12.next = 18;
                return Memobird.getImageDataFromUrl(image);

              case 18:
                bodyBuffer = _context12.sent;
                _context12.next = 21;
                return Memobird.localImageConversion(bodyBuffer, width);

              case 21:
                signalColorBmpBase64Data = _context12.sent;

              case 22:
                return _context12.abrupt('return', Memobird.formatImage(signalColorBmpBase64Data));

              case 23:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));

      function encodeImageLocally(_x17, _x18) {
        return _ref16.apply(this, arguments);
      }

      return encodeImageLocally;
    }()
  }, {
    key: 'printUrl',
    value: function () {
      var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(_printUrl) {
        var _ref18, printcontentid;

        return _regenerator2.default.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _context13.next = 2;
                return this.post('url', { userID: this.userID, printUrl: _printUrl });

              case 2:
                _ref18 = _context13.sent;
                printcontentid = _ref18.printcontentid;
                return _context13.abrupt('return', printcontentid);

              case 5:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function printUrl(_x19) {
        return _ref17.apply(this, arguments);
      }

      return printUrl;
    }()
  }, {
    key: 'printHtml',
    value: function () {
      var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(printHtmlString) {
        var printHtml, _ref20, printcontentid;

        return _regenerator2.default.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                printHtml = iconv.encode(printHtmlString, 'gbk').toString('base64');
                _context14.next = 3;
                return this.post('html', { userID: this.userID, printHtml: printHtml });

              case 3:
                _ref20 = _context14.sent;
                printcontentid = _ref20.printcontentid;
                return _context14.abrupt('return', printcontentid);

              case 6:
              case 'end':
                return _context14.stop();
            }
          }
        }, _callee14, this);
      }));

      function printHtml(_x20) {
        return _ref19.apply(this, arguments);
      }

      return printHtml;
    }()
  }, {
    key: 'timestamp',
    get: function get() {
      return moment().format('YYYY-MM-DD HH:mm:ss');
    }
  }]);
  return Memobird;
}();

module.exports = Memobird;