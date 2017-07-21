# memobird
咕咕机 Node.js SDK

* [安装](#安装)
* [使用](#使用)
	* [打印文字](#打印文字)
	* [打印图片](#打印图片)
	* [打印Canvas](#打印canvas)
	* [一次打印多个](#一次打印多个)
	* [获取打印状态](#获取打印状态)
* [参数](#参数)
* [示例](#示例)

## 安装

	npm install memobird

## 使用

### 初始化

```javascript
const Memobird = require('Memobird');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});
```

### 打印文字
`printText(text)` 方法可以打印文字。

```javascript
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
```

### 打印图片
> 由于咕咕机要求接收的图片必须是单色点位图base64编码值，printImage使用了graphicsmagick来实现这一图片格式转换的功能，所以使用printImage方法必须先[安装](./GRAPHICSMAGICK.md)graphicsmagick。

`printImage(image, width)` 方法可以打印任何格式的图片。参数中的`image`可以是`图片的本地路径`或`图片的网络地址`或`图片的base64编码`；参数中的`width`指打印宽度，默认为384是咕咕机打印区总宽度。

```javascript
memobird.init()
  .then(() => memobird.printImage('http://7xrs2s.com1.z0.glb.clouddn.com/5388545BF2D3F99643AFE22BE8C87B8A.jpg'))
  .then(() => memobird.printImage('http://7xrs2s.com1.z0.glb.clouddn.com/5388545BF2D3F99643AFE22BE8C87B8A.jpg', 100))
  .then(() => memobird.printImage('data:image/jpeg;base64,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', 96))
```

### 打印Canvas
> 很多场景下，我们需要打印更丰富的内容，本模块可以直接打印H5的canvas。如果你感兴趣，canvas转单色点位图的功能是通过我编写的模块[binary-bmp](https://github.com/sherluok/binary-bmp)实现的。

`encodeCanvas(canvas)`静态方法可以将canvas转为单色点位图base64编码值。
`printBmp(bmp)`方法可以打印单色点位图base64编码值。

浏览器中:

```javascript
const Memobird = require('memobird');
const canvas = document.getElementById('canvas-id'); // 获取canvas对象
const bmp = Memobird.encodeCanvas(canvas); // 将canvas转为单色点位图base64编码值
// ...
// 省略代码：将bmp的值传给服务器
// ...
```

服务器中:

```javascript
// ...
// 省略代码：接收客户端发来的bmp的值
// ...
memobird.init()
  .then(() => memobird.print(bmp));
```


### 一次打印多个

> 咕咕机每次打印一份内容都会留出上下间距，如果你不想看到这些上下间距可以选择一次性打印多个内容。

`print(item1, item2, ...)`方法可以一次性打印多个内容。<br>
`encodeText(text)`静态方法可以将文本转为`print`方法可以处理的内容。<br>
`encodeImage(image, width)`静态方法可以将图片转为`print`方法可以处理的内容。<br>
`encodeCanvas(canvas)`静态方法可以将canvas对象转为`print`方法可以处理的内容。

```javascript
memobird.init()
  .then(() => memobird.print(
    Memobird.encodeText('你好咕咕机，能不能一次性打印所有东西？'),
    Memobird.encodeImage('http://7xrs2s.com1.z0.glb.clouddn.com/5388545BF2D3F99643AFE22BE8C87B8A.jpg', 100)
  ))；
```

### 获取打印状态
`glance(printcontentid, delay)`方法可以延时一定时间后获取咕咕机打印状态。`printcontentid`参数指打印内容的唯一ID，由所有名字以print开头的方法返回；`delay`参数指延时多少毫秒后才获取打印状态，默认1000。

```javascript
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
  .then(printcontentid => memobird.glance(printcontentid, 1000))
  .then(printflag => console.log('打印状态:', printflag));
```

`watch(printcontentid, interval, max)` 方法可以监听打印状态。当打印时间难以预测时，watch方法可以隔一段时间获取一次打印状态，只有当打印状态为已完成或监听时间超时时才终止。`printcontentid`参数指打印内容的唯一ID；`interval`参数指监听频率，即多少毫秒获取一次打印状态，默认3000；`max`参数指监听超时，即超出多长时间立即终止监听，默认15000。

```javascript
memobird.init()
  .then(() => memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'))
  .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
  .then(printflag => console.log('打印状态:', printflag));
```

## 示例

参考  [examples/index.js](./examples/index.js)

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
