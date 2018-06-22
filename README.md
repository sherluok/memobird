# memobird
咕咕机 Node.js SDK
* [Updates](#updates)
* [安装和使用](#安装和使用)
* 打印
	* [文字](#打印文字)
	* [图片](#打印图片)
	* [网页](#打印网页)
	* [Html](#打印html)
	* [Canvas](#打印canvas)
	* [一次打印多个](#一次打印多个)
	* [获取打印状态](#获取打印状态)
* [示例](#示例)

## Updates

* 适配最新[咕咕机API接口](http://open.memobird.cn/upload/webapi.pdf)（V0.5）
* 新增网页打印，HTML打印功能
* 新增图片打印在线转码的支持，打印图片不再必须安装 graphicsmagick
* 修复了若干问题

## 安装和使用

### 安装

```sh
npm install memobird
```

### 初始化

```javascript
const Memobird = require('Memobird');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});
```

## 打印

### 打印文字

`printText(text)`

```javascript
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
```

### 打印图片
> 由于咕咕机要求的图片数据必须是 bmp 单色点位图 base64 编码，所以打印 jpeg 或者 png 等格式的图片需要使用到图片转码的功能。本模块提供了本地转码和在线转码两种方式。

`printImage(image, width)`

* `image`
	* 图片的本地路径
	* 图片的网络地址
	* 图片数据的 base64 编码
* `width`
	* 缺省 => 使用在线转码
	* 提供 => 使用本地转码

```javascript
memobird.init()
  .then(() => memobird.printImage('./examples/local-image.png'))
  .then(() => memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'))
  .then(() => memobird.printImage('data:image/jpeg;base64,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'))
```

#### 在线转码图片（缺省 width 参数）

在线转码是利用了咕咕机API的`获取单色位图`接口，这个接口只能处理 jpeg 和 png 格式的图片，并且不能调整图片宽度。缺省`width`参数就会使用在线转码的方式。

```javascript
memobird.init()
  .then(() => memobird.printImage('./examples/local-image.png'))
```

#### 本地转码图片 （提供 width 参数）

本地转码支持更多的图片格式，而且能够调整图片的打印宽度。使用本地转码需要先[安装graphicsmagick](./GRAPHICSMAGICK.md)。提供`width`参数就会使用本地转码的方式。

```javascript
memobird.init()
  .then(() => memobird.printImage('./examples/local-image.png', 50))
```

## 打印网页

`printUrl(url)`

```javascript
memobird.init()
  .then(() => memobird.printUrl('http://open.memobird.cn/Home/testview'))
```

## 打印Html

`printHtml(htmlString)`

```javascript
memobird.init()
  .then(() => memobird.printHtml('<html><body><h1>Hello World!</h1></body></html>'))
```

## 打印Canvas

> 很多场景下，我们需要打印更丰富的内容。<br>
> 可以使用 canvas 精确控制自己想呈现的内容，并利用我编写的模块 [`binary-bmp`](https://github.com/sherluok/binary-bmp) 将 canvas 对象处理单色点位图 base64 编码值。得到编码值以后，传入 `print` 方法打印。canvas 可以是浏览器中的 `<canvas>` 或者 Node.js 中的实现的服务端 canvas 比如 [`node-canvas`](https://github.com/Automattic/node-canvas)。<br>
> 参考 [examples/canvas/server.js](./examples/canvas/server.js)

浏览器中:

```javascript
import Bmp from 'binary-bmp';

const canvas = document.getElementById('canvas-id'); // 获取canvas对象
const bitmap = new Bmp(Bmp.BINARY, canvas);
const base64 = bitmap.flip().getBase64(true); // 将canvas转为单色点位图base64编码值
const item = `P:${base64}`; // 咕咕机要求的格式: 'P:图片'
// ...
// 省略代码：将item的值传给服务器
// ...
```

服务器中:

```javascript
// ...
// 省略代码：接收客户端发来的item的值
// ...
memobird.init()
  .then(() => memobird.print(item));
```


### 一次打印多个

> 咕咕机每次打印一份内容都会留出上下间距，如果你不想看到这些上下间距可以选择一次性打印多个内容。

`print(item1, item2, ...)`

* `item`: 要打印的内容，是以 `encode` 开头命名的方法的返回值

`encode` 类型方法:

* `printText(text)` == `print(encodeText(text))`
* `printImage(image, width)` == `print(encodeImage(image, width))`
* `printCanvas(canvas)` == `print(encodeCanvas(canvas))`

```javascript
memobird.init()
  .then(() => memobird.print(
    memobird.encodeText('你好咕咕机，能不能一次性打印所有东西？'),
    memobird.encodeImage('./examples/local-image.png', 100),
  ));
```

### 获取打印状态

#### 延时获取打印状态

`glance(printcontentid, delay)`

* `printcontentid`: 打印内容唯一 ID, 由所有以 `print` 开头命名的方法返回
* `delay`: 延时，即等待多少毫秒后再执行获取打印状态，默认1000。

```javascript
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
  .then(printcontentid => memobird.glance(printcontentid, 1000))
  .then(printflag => console.log('打印状态:', printflag));
```

#### 监听打印状态

`watch(printcontentid, interval, max)`

* `printcontentid`: 打印内容唯一 ID, 由所有以 `print` 开头命名的方法返回
* `interval`: 监听周期, 默认3000
* `max`: 监听超时，即超出多少毫秒后立即终止监听，默认15000。

当打印时间难以预测时，`watch` 方法可以隔一段时间获取一次打印状态，只有当打印状态为已完成或监听时间超时时才终止。

```javascript
memobird.init()
  .then(() => memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'))
  .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
  .then(printflag => console.log('打印状态:', printflag));
```


## 示例

参考 [examples/index.js](./examples/index.js)

```javascript
const Memobird = require('../');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});

memobird.init()
  // 打印文本
  .then(() => memobird.printText('你好咕咕机!'))
  // 3000毫秒后获取打印状态
  .then(printcontentid => memobird.glance(printcontentid, 3000))
  .then(printflag => console.log('打印状态:', printflag === 1 ? '已打印' : '未打印'))

  // 打印图片
  .then(() => memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'), 100)
  // 每3000毫秒获取一次打印状态，如果显示未打印则继续获取，当获取到结果为已打印的状态或总用时超出15000毫秒，则终止并返回结果
  .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
  .then(printflag => console.log('打印状态:', printflag === 1 ? '已打印' : '未打印'))

  // 一次性打印多个
  .then(() => memobird.print(
    memobird.encodeText('你好咕咕机，能不能一次性打印所有东西？'),
    memobird.encodeText('第一张图片：'),
    memobird.encodeImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png', 50),
    memobird.encodeText('第二张图片：'),
    memobird.encodeImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png', 100),
    memobird.encodeText('第三张图片：'),
    memobird.encodeImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png')
  ))
  .catch(error => console.log('打印出错了：', error));
```
