export function toBase64(source: string | ArrayBuffer | Uint8Array): string {
  if (source instanceof Uint8Array || source instanceof ArrayBuffer) {
    return Buffer.from(source).toString('base64');
  } else {
    return Buffer.from(source).toString('base64');
  }
}
