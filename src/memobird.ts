import { Bitmap, Bits, CanvasLike } from 'binary-bmp';
import { encode } from 'iconv-lite';
import { timestamp } from './date';
import { fetchImage, sharpImage } from './image';

/** 打印内容的唯一 ID */
export type PrintContentId = number;
/** 打印状态; `1` 为已打印，其他为未打印。 */
export type PrintFlag = number;

export type Text = `T:${string}`;
export type Image = `P:${string}`;
export type Printable = Text | Image;

export interface MemobirdInit {
  /** 第三方应用软件签名 */
  ak: string;
  /** 咕咕机的设备编号（双击设备吐出来的设备编号） */
  memobirdID: string;
  /** 与咕咕平台进行关联的用户唯一标识符（用户自定义字符串） */
  useridentifying: string;
}

interface ICommonRequest {
  /** 第三方应用签名 */
  ak: string;
  /** 客户端时间。格式 2014-11-14 14:22:39 */
  timestamp: string;
}

interface ICommonResponse {
  /** 返回标志，1 为成功，其他为失败。 */
  showapi_res_code: number;
  /** Ak 错误信息的显示 */
  showapi_res_error: string;
}

interface ISetUserBindRequest {
  /** 咕咕机的设备编号 */
  memobirdID: string;
  /** 与咕咕平台进行关联的用户唯一标识符 */
  useridentifying: string;
}

interface ISetUserBindResponse {
  showapi_userid: number;
}

interface IPrintPaperRequest {
  /**
   * 文本内容(汉字要 GBK 格式的 Base64)/图片(图片为单色点位图)的 Base64 编码值
   * - T:文本
   * - P:图片
   */
  printcontent: string;
  /** 咕咕机的设备编号 */
  memobirdID: string;
  /** 账号关联返回的 showapi_userid 值 */
  userID: number;
}

interface IPrintResponse {
  /** 返回标志，1 为已打印，其他为未打印。 */
  result: PrintFlag;
  /** 返回打印内容的唯一 ID */
  printcontentid: PrintContentId;
  /** 打印设备的编号 */
  smartGuid: string;
}

interface IPrintPaperResponse extends IPrintResponse {
}

interface IGetPrintStatusRequest {
  /** 打印内容的唯一 ID */
  printcontentid: PrintContentId;
}

interface IGetPrintStatusResponse {
  /** 返回标志，1 为已打印，其他为未打印。 */
  printflag: PrintFlag;
  /** 返回打印内容的唯一 ID */
  printcontentid: PrintContentId;
}

interface IGetSignalBase64PicRequest {
  /** Jpg 或者 png 的 base64 的值 */
  imgBase64String: string;
}

interface IGetSignalBase64PicResponse {
  /** 返回处理后的图片 base64 值，直接用于打印接口 */
  result: string;
}

interface IPrintPaperFromUrlRequest {
  /**
   * 打印网页的地址。最好为静态页面或者服务器渲染页面，以下情况可能导致打印错误：
   * 1. 用 ajax 渲染的页面；
   * 2. 网页内容数据过大；
   * 3. 页面加载太慢；
   * 4. 如果有图片没有采用完整路径；例如 `src="/img/test.png"`；
   * 5. css 没有写在 html 页面上。
   */
  printUrl: string;
  /** 咕咕机的设备编号 */
  memobirdID: string;
  /** 账号关联返回的 showapi_userid 值 */
  userID: number;
}

interface IPrintPaperFromUrlResponse extends IPrintResponse  {
}

interface IPrintPaperFromHtmlRequest {
  /**
   * 打印 html 源码。备注：
   * 1. 如果有图片必须采用完整路径；
   * 2. css 必须写在 html 页面上；
   * 3. html 源码需要进行 gbk 的 base64 编码，然后进行 URL 编码。
   */
  printHtml: string;
  /** 咕咕机的设备编号 */
  memobirdID: string;
  /** 账号关联返回的 showapi_userid 值 */
  userID: number;
}

interface IPrintPaperFromHtmlResponse extends IPrintResponse {
}

export class Memobird {
  #init: MemobirdInit;
  #userId?: number;

  constructor(init: MemobirdInit) {
    this.#init = init;
  }

  private post(url: 'https://open.memobird.cn/home/setuserbind', data: ISetUserBindRequest): Promise<ISetUserBindResponse>;
  private post(url: 'https://open.memobird.cn/home/getprintstatus', data: IGetPrintStatusRequest): Promise<IGetPrintStatusResponse>;
  private post(url: 'https://open.memobird.cn/home/getSignalBase64Pic', data: IGetSignalBase64PicRequest): Promise<IGetSignalBase64PicResponse>;
  private post(url: 'https://open.memobird.cn/home/printpaper', data: IPrintPaperRequest): Promise<IPrintPaperResponse>;
  private post(url: 'https://open.memobird.cn/home/printpaperFromUrl', data: IPrintPaperFromUrlRequest): Promise<IPrintPaperFromUrlResponse>;
  private post(url: 'https://open.memobird.cn/home/printpaperFromHtml', data: IPrintPaperFromHtmlRequest): Promise<IPrintPaperFromHtmlResponse>;

  private async post(url: string, data: object): Promise<unknown> {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ak: this.#init.ak,
        timestamp: timestamp(),
        ...data,
      }),
    });

    const {
      showapi_res_code,
      showapi_res_error,
      ...rest
    } = await res.json() as ICommonResponse;

    if (showapi_res_code === 1) {
      return rest;
    } else {
      throw new Error(showapi_res_error, {
        cause: showapi_res_code,
      });
    }
  }

  /** 账号关联 */
  private async getUserId(): Promise<number> {
    if (!this.#userId) {
      const { showapi_userid } = await this.post('https://open.memobird.cn/home/setuserbind', {
        memobirdID: this.#init.memobirdID,
        useridentifying: this.#init.useridentifying,
      });
      this.#userId = showapi_userid;
    }
    return this.#userId;
  }

  /** @deprecated 该方法已弃用。调用 `print*` 方法时会自动按需执行初始化操作。 */
  async init(): Promise<void> {
    console.warn('init() 方法已弃用。调用 `print*` 方法时会自动按需执行初始化操作。');
    await this.getUserId();
  }

  /**
   * 获取打印状态。
   * @param printContentId 打印内容 ID；由所有以 **print** 开头命名的方法返回。
   * @param delayMs 延迟多少毫秒后再执行获取打印状态；默认 `1000`。
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  async glance(printContentId: PrintContentId, delayMs = 1000): Promise<PrintFlag> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const res = await this.post('https://open.memobird.cn/home/getprintstatus', {
      printcontentid: printContentId,
    });
    return res.printflag;
  }

  /**
   * 监听打印状态。当打印时间难以预测时，该方法可以隔一段时间获取一次打印状态，只有当打印状态为已完成或监听时间超时时才终止。
   * @param printContentId 打印内容 ID；由所有以 **print** 开头命名的方法返回。
   * @param intervalMs 监听周期；默认 `3000`。
   * @param maxTotalMs 监听超时；即超出多少毫秒后立即终止监听，默认 `15000`。
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  async watch(printContentId: PrintContentId, intervalMs = 3000, maxTotalMs = 15000): Promise<PrintFlag> {
    let printFlag = -1;
    const interval = Math.max(intervalMs, 1);
    for (let i = 0; i < maxTotalMs; i += interval) {
      printFlag = await this.glance(printContentId, interval);
      if (printFlag === 1) {
        break;
      }
    }
    return printFlag;
  }

  /**
   * 一次打印多个。咕咕机每次打印一份内容都会留出上下间距，如果你不想看到这些上下间距可以选择一次性打印多个内容。
   * @param items 要打印的内容；是以 **encode** 开头命名的方法的返回值。
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  async print(...items: (Printable | Promise<Printable>)[]): Promise<PrintContentId> {
    const userId = await this.getUserId();
    const content = (await Promise.all(items)).join('|');
    const res = await this.post('https://open.memobird.cn/home/printpaper', {
      memobirdID: this.#init.memobirdID,
      userID: userId,
      printcontent: content,
    });
    return res.printcontentid;
  }

  /**
   * 打印文本。
   * @param content 文本内容。
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  printText(content: string): Promise<PrintContentId> {
    return this.print(this.encodeText(content));
  }

  printImage(src: string, width?: number): Promise<PrintContentId> {
    return this.print(this.encodeImage(src, width));
  }

  printCanvas(canvas: CanvasLike): Promise<PrintContentId> {
    return this.print(this.encodeCanvas(canvas));
  }

  /**
   * 通过 URL 地址打印网页。
   * @param url 网页的 URL 地址
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  async printUrl(url: string | URL): Promise<PrintContentId> {
    const userId = await this.getUserId();
    const href = url.toString();
    const res = await this.post('https://open.memobird.cn/home/printpaperFromUrl', {
      memobirdID: this.#init.memobirdID,
      userID: userId,
      printUrl: href,
    });
    return res.printcontentid;
  }

  /**
   * 通过 HTML 源码打印网页。
   * @param code HTML 源代码。
   * @returns 打印标志；`1` 为已打印，其他为未打印。
   */
  async printHtml(code: string): Promise<PrintContentId> {
    const userId = await this.getUserId();
    // @todo 是否需要进一步进行 URL 编码
    const base64 = encode(code, 'gbk').toString('base64');
    const res = await this.post('https://open.memobird.cn/home/printpaperFromHtml', {
      memobirdID: this.#init.memobirdID,
      userID: userId,
      printHtml: base64,
    });
    return res.printcontentid;
  }

  /**
   * 编码文本。
   * @param content 文本内容。
   * @returns 文本内容格式 `T:<GBK-BASE64>` 的字符串。
   */
  encodeText(content: string): Text {
    return `T:${encode(`${content}\n`, 'gbk').toString('base64')}`;
  }

  /**
   * 编码 Canvas
   * @param canvas 符合 {@link CanvasLike} 接口的对象；包括但不限于 [HTMLCanvasElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)、[OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)、[node-canvas](https://github.com/Automattic/node-canvas)。
   * @returns 图片内容格式 `P:<BMP-BASE64>` 的字符串。
   * @example sdadsadasdasd
   * ```ts
   * ctx.save();
   * ctx.translate(0, canvas.height);
   * ctx.scale(1, -1);
   *
   * // 将绘制内容放置在垂直翻转的上下文中
   *
   * ctx.restore();
   *
   * memobird.print(memobird.encodeCanvas(canvas));
   * ```
   */
  encodeCanvas(canvas: CanvasLike): Image {
    const bitmap = Bitmap.fromCanvas(canvas).flip().bits(Bits.BINARY);
    const base64 = Buffer.from(bitmap.uint8Array()).toString('base64');
    return `P:${base64}`;
  }

  /**
   * 编码图片。
   * @param src 图片数据；可以是 URL 地址、本地文件路径、图片数据的 base64 编码。
   * @param width 图片宽度；缺省或等于 `undefined` 时使用在线转码；否则在本地使用 [sharp](https://github.com/lovell/sharp) 缩放并转码（小于等于 `0` 时，缩放至宽度 `384`）。
   * @returns 图片内容格式 `P:<BMP-BASE64>` 的字符串。
   */
  async encodeImage(src: string, width?: number): Promise<Image> {
    const imgBuffer = await fetchImage(src);
    if (width === undefined) {
      const imgBase64String = imgBuffer.toString('base64');
      const binaryBmpBase64 = await this.post('https://open.memobird.cn/home/getSignalBase64Pic', { imgBase64String }).then((res) => res.result);
      return `P:${binaryBmpBase64}`;
    } else {
      const binaryBmpBuffer = await sharpImage(imgBuffer, width);
      const binaryBmpBase64 = Buffer.from(binaryBmpBuffer).toString('base64');
      return `P:${binaryBmpBase64}`;
    }
  }
}
