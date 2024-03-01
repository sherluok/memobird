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

  if (channels === 3 && data.byteLength === width * height * 3) {
    return new Bitmap({ bits: Bits.RGB, width, height, data }).bits(Bits.BINARY).uint8Array();
  }

  if (channels === 4 && data.byteLength === width * height * 4) {
    return new Bitmap({ bits: Bits.RGBA, width, height, data }).bits(Bits.BINARY).uint8Array();
  }

  throw new Error('Cannot convert input image into RGBA/RGB channels!');
}
