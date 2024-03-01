import { Bitmap, Bits } from 'binary-bmp';
import { readFile } from 'node:fs/promises';
import { default as createSharp } from 'sharp';

export function fetchImage(src: string): Buffer | Promise<Buffer> {
  if (/^https?\:\/\//.test(src)) {
    return fetch(src).then((res) => res.arrayBuffer()).then((arrayBuffer) => Buffer.from(arrayBuffer));
  } else if (/^data:image\/\w+;base64,/.test(src)) {
    const base64Data = src.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } else {
    return readFile(src);
  }
  // throw new Error(`Unknow image src type: ${JSON.stringify(src)}`);
}

export async function sharpImage(input: Buffer, resizeToWidth: number): Promise<Uint8Array> {
  const realResizeWidth = resizeToWidth <= 0 ? 384 : resizeToWidth;
  const sharp = createSharp(input);
  const raw = await sharp
    .ensureAlpha()
    .flatten({ background: "#ffffff" })
    .resize({ width: realResizeWidth })
    .flip()
    .raw()
    .toBuffer({ resolveWithObject: true })
  ;

  const { info: { width, height, channels }, data } = raw;

  if (channels !== 4 || data.byteLength !== width * height * 4) {
    throw new Error('Cannot convert input image into rgba channels!');
  }

  return new Bitmap({
    bits: Bits.RGBA,
    width,
    height,
    data,
  }).uint8Array();
}
