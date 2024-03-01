export function timestamp(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss'): string {
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const H = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  return format
    .replace('YYYY', Y.toString())
    .replace('MM', M.toString().padStart(2, '0'))
    .replace('DD', D.toString().padStart(2, '0'))
    .replace('HH', H.toString().padStart(2, '0'))
    .replace('mm', m.toString().padStart(2, '0'))
    .replace('ss', s.toString().padStart(2, '0'))
  ;
}
