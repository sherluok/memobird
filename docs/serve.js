/**
 * 在同级文件夹中创建 `account.json` 文件并写入：
 * ```json
 * {
 *   "ak": "xxxxxxxxxxxxxxxxx",
 *   "memobirdID": "xxxxxxxxx",
 *   "useridentifying": "xxxx"
 * }
 * ```
 * 然后执行以下命令：
 * ```sh
 * node ./docs/serve.js
 * ```
 */

const { createReadStream, readFileSync } = require('node:fs');
const { createServer } = require('node:http');
const { join } = require('node:path');

const Memobird = require('..');

const account = JSON.parse(readFileSync(join(__dirname, 'account.json'), 'utf-8'));

const memobird = new Memobird(account);

createServer(async (req, res) => {
  switch (req.url) {
    case '/':
    case '/index.html': {
      createReadStream(join(__dirname, 'index.html')).pipe(res);
      break;
    }
    case '/print-binary-bmp': {
      const base64 = await new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.once('error', (error) => reject(error));
        req.once('end', () => {
          resolve(Buffer.concat(chunks).toString('base64'));
        });
      });

      const printContentId = await memobird.print(`P:${base64}`);
      const printFlag = await memobird.watch(printContentId, 3000, 9000);
      res.write(JSON.stringify({ printContentId, printFlag }));
      res.end();
      break;
    }
    default: {
      res.writeHead(404);
      res.end();
      break;
    }
  }
}).listen(3456, () => {
  console.log('Canvas Example Server Running at http://localhost:3456');
});
