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

var fs = require('fs');
var gm = require('gm');
var moment = require('moment');
var request = require('request');
var iconv = require('iconv-lite');
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
                  setTimeout(resolve, time);
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
  }]);

  function Memobird() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Memobird);

    this.ak = config.ak;
    this.memobirdID = config.memobirdID;
    this.useridentifying = config.useridentifying;
  }

  (0, _createClass3.default)(Memobird, [{
    key: 'post',


    // api请求
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
        }, function (error, response, body) {
          var statusCode = response.statusCode;

          var data = JSON.parse(body);
          var showapi_res_code = data.showapi_res_code,
              showapi_res_error = data.showapi_res_error;

          if (error || statusCode !== 200 || showapi_res_code !== 1) {
            reject({ error: error, statusCode: statusCode, showapi_res_code: showapi_res_code, showapi_res_error: showapi_res_error });
          } else {
            resolve(data);
          }
        });
      });
    }

    // 账号关联

  }, {
    key: 'init',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var _ref3, showapi_userid;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.inited) {
                  _context2.next = 7;
                  break;
                }

                _context2.next = 3;
                return this.post('bind', { useridentifying: this.useridentifying });

              case 3:
                _ref3 = _context2.sent;
                showapi_userid = _ref3.showapi_userid;

                this.userID = showapi_userid;
                this.inited = true;

              case 7:
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

      function getPrintStatus(_x3) {
        return _ref4.apply(this, arguments);
      }

      return getPrintStatus;
    }()
    // 延时一定时间后获取咕咕机打印状态

  }, {
    key: 'glance',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(printcontentid) {
        var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
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
                return _context4.abrupt('return', _context4.sent);

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function glance(_x4) {
        return _ref6.apply(this, arguments);
      }

      return glance;
    }()
    // 监听打印状态

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

      function watch(_x6) {
        return _ref7.apply(this, arguments);
      }

      return watch;
    }()

    // 纸条打印

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
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.print(this.encodeText(text));

              case 2:
                return _context7.abrupt('return', _context7.sent);

              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function printText(_x9) {
        return _ref10.apply(this, arguments);
      }

      return printText;
    }()
  }, {
    key: 'encodeText',
    value: function encodeText(text) {
      return 'T:' + iconv.encode(text + '\n', 'gbk').toString('base64');
    }

    // 打印位图

  }, {
    key: 'printBmp',
    value: function () {
      var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(base64) {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.print(this.encodeBmp(base64));

              case 2:
                return _context8.abrupt('return', _context8.sent);

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function printBmp(_x10) {
        return _ref11.apply(this, arguments);
      }

      return printBmp;
    }()
  }, {
    key: 'encodeBmp',
    value: function encodeBmp(base64) {
      return 'P:' + base64;
    }

    // 根据图片路径打印

  }, {
    key: 'printImage',
    value: function () {
      var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(imagePath, width) {
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.t0 = this;
                _context9.next = 3;
                return this.encodeImage(imagePath, width);

              case 3:
                _context9.t1 = _context9.sent;
                _context9.next = 6;
                return _context9.t0.print.call(_context9.t0, _context9.t1);

              case 6:
                return _context9.abrupt('return', _context9.sent);

              case 7:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function printImage(_x11, _x12) {
        return _ref12.apply(this, arguments);
      }

      return printImage;
    }()
  }, {
    key: 'encodeImage',
    value: function encodeImage(imagePath, width) {
      return new _promise2.default(function (resolve, reject) {
        // 处理图片
        function data2base64(data) {
          gm(data).resize(width || 384).flip().type('Bilevel').colors(2).toBuffer('bmp', function (error, buffer) {
            if (error) {
              reject(error);
            } else {
              resolve('P:' + buffer.toString('base64'));
            }
          });
        }
        // 获取图片
        if (/^data:image\/\w+;base64,/.test(imagePath)) {
          // base64格式的图片
          var base64Data = imagePath.replace(/^data:image\/\w+;base64,/, '');
          var dataBuffer = new Buffer(base64Data, 'base64');
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
          request(imagePath, { encoding: null }, function (error, response, bodyBuffer) {
            if (error) {
              reject(error);
            } else {
              data2base64(bodyBuffer);
            }
          });
        }
      });
    }
  }, {
    key: 'timestamp',
    get: function get() {
      return moment().format('YYYY-MM-DD HH:mm:ss');
    }
  }]);
  return Memobird;
}();

module.exports = Memobird;