![](./docs/memobird.png)

**memobird** 是一个咕咕机 Node.js SDK，基于[咕咕机开放平台](https://open.memobird.cn/)。

- [安装](#安装)
- 打印
	- [打印文本](#打印文本)
	- [打印图片](#打印图片)
	- [打印网页](#打印网页)
	- [打印 Canvas](#打印-canvas)
	- [获取打印状态](#获取打印状态)
- 示例
	- [`./docs/serve.js`](./docs/serve.js)

## 更新日志

**`V1.0.0 2024-02-09`**

- 支持 Typescript
- 图片本地打印切换至 sharp 库
- 减小编译产物体积

### 安装

```sh
npm install memobird
```

### 初始化

```typescript
import Memobird from 'memobird';

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx', // 第三方应用软件签名
  memobirdID: 'xxxxxxxx', // 咕咕机的设备编号
  useridentifying: 'xxx', // 用户唯一标识符
});
```

### 打印文本

**`printText(text: string): Promise<PrintContentId>`**

```typescript
await memobird.printText('你好咕咕机');
```

### 打印图片

由于咕咕机要求的图片数据必须是单色位图，所以打印 `jpeg` 或者 `png` 等格式的图片需要使用到图片转码的功能。本模块提供了本地转码和在线转码两种方式。

**`printImage(image: string, width?: number): Promise<PrintContentId>`**

- `image`
	- 本地图片的文件路径：例如 `"./examples/jpeg420exif.jpg"`
	- 网络图片的 URL 地址：例如 `"https://open.memobird.cn/images/logo.png"`
	- 图片数据的 Base64 编码：例如 `"data:image/jpeg;base64,..."`
- `width`
	- 缺省：使用[在线转码](#在线转码图片)
	- 提供：使用[本地转码](#本地转码图片)

```typescript
await memobird.printImage('./examples/local-image.png', 0);
await memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png', 150);
await memobird.printImage('data:image/jpeg;base64,...');
```

#### 在线转码图片

缺省 `width` 参数时，内部通过咕咕机官方提供的["获取单色位图"]((https://open.memobird.cn/upload/webapi.pdf))接口进行转码。该接口只能处理 `jpeg` 和 `png` 格式的图片，且不能调整图片宽度。

```typescript
await memobird.printImage('./examples/local-image.png');
```

#### 本地转码图片

提供 `width` 参数时，内部通过 [sharp](https://github.com/lovell/sharp) 库实现。本地转码支持更多的图片格式，并且能够调整图片的打印宽度。传入的 `width` 小于等于 `0` 时，图片缩放至宽度 `384`（咕咕机最大内容宽度）。

```typescript
await memobird.printImage('./examples/local-image.png', 0);
```

### 打印网页

提供 URL 地址或 HTML 源码打印网页式使用了咕咕机官方提供的接口，这些接口存在一些限制，以下情况可能导致打印错误：
1. 用 AJAX 渲染的页面；
2. 网页内容数据过大；
3. 页面加载太慢；
4. 如果有图片没有采用完整路径；
5. CSS 没有写在 HTML 页面上。

#### 通过 URL 地址打印网页

**`printUrl(url: string | URL): Promise<PrintContentId>`**

```typescript
await memobird.printUrl('http://open.memobird.cn/Home/testview');
```

#### 通过 HTML 源代码打印网页

**`printHtml(code: string): Promise<PrintContentId>`**

```typescript
await memobird.printHtml(`<html><body><h1>Hello World!</h1></body></html>`);
```

### 打印 Canvas

很多场景下，我们需要打印更丰富的内容。可以使用 [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) 精确控制自己想呈现的内容，并利用我编写的模块 [binary-bmp](https://github.com/sherluok/binary-bmp) 将 canvas 对象处理成单色点位图 Base64 编码值。得到编码值以后，然后传入 `print` 方法打印。canvas 对象可以是浏览器中的 [`HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)、[`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) 或者服务端的 [node-canvas](https://github.com/Automattic/node-canvas) 库创建的对象。参考 [`./examples/canvas/server.js`](./examples/canvas/server.js)。

浏览器中:

```typescript
import { Bits, Bitmap } from 'binary-bmp';

const canvas = document.getElementById('canvas-id'); // 获取 canvas 对象
const uint8array = Bitmap.fromCanvas(canvas).flip().bits(Bits.BINARY); // 读取 canvas 数据，垂直镜像，然后转为单色点位图

// ...
// 省略代码：将 Base64 编码的单色点位图传给服务器
// ...
```

服务器中:

```typescript
// ...
// 省略代码：接收客户端发来的 Base64 字符串
// ...

const base64 = Buffer.from(uint8array).toString('base64');
await memobird.print(`P:${base64}`);
```

### 一次打印多个

咕咕机每次打印一份内容都会留出上下间距，如果你不想看到这些上下间距可以选择一次性打印多个内容。

**`print(...items: (string | Promise<string>)[]): Promise<PrintContentId>`**
- `item`: 要打印的内容；是以 `encode` 开头命名的方法的返回值，详见[编码方法](#编码方法)。

```typescript
await memobird.print(
  memobird.encodeText('你好咕咕机，能不能一次性打印所有东西？'),
  memobird.encodeImage('./docs/memobird.png', 100),
);
```

### 获取打印状态

#### 延时获取打印状态

**`glance(printContentId: PrintContentId, delayMs?: number): Promise<PrintFlag>`**
- `printContentId`：打印内容 ID；由所有以 `print` 开头命名的方法返回。
- `delayMs`：延时；即等待多少毫秒后再执行获取打印状态，默认 `1000` 毫秒。

```typescript
const contentId = await memobird.printText('Hello');
const printFlag = await memobird.glance(contentId);
console.log(printFlag === 1 ? '已打印' : '打印中...');
```

#### 持续监听打印状态

**`watch(printContentId: PrintContentId, intervalMs: number, maxTotalMs: number): Promise<PrintFlag>`**
- `printContentId`：打印内容 ID；由所有以 `print` 开头命名的方法返回。
- `intervalMs`：监听周期；默认 `3000` 毫秒。
- `maxTotalMs`：监听超时；即超出多少毫秒后立即终止监听，默认 `15000` 毫秒。

当打印时间难以预测时，`watch` 方法可以隔一段时间获取一次打印状态，只有当打印状态为已完成或监听时间超时时才终止。

```typescript
const contentId = await memobird.printImage('https://open.memobird.cn/images/logo.png');
const printFlag = await memobird.watch(contentId, 3000, 15000);
console.log(printFlag === 1 ? '已打印' : '打印中...');
```

### 编码方法

方法签名|作用|返回的字符串结构
--|--|--
**`encodeText(text: string): string`** | 编码文本 | `T:{Base64-GBK}`
**`encodeCanvas(canvas: CanvasLike): string`** | 编码 Canvas 对象 | `P:{Base64-BinaryBMP}`
**`encodeImage(image: string, width?: number): Promise<string>`** | 编码图片 | `P:{Base64-BinaryBMP}`
