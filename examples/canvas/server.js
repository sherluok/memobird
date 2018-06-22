const fs = require('fs');
const path = require('path');
const http = require('http');
const Memobird = require('../../');
const config = require('../config');

const memobird = new Memobird({
  ak: config.ak,
  memobirdID: config.memobirdID,
  useridentifying: config.useridentifying,
});

const html = fs.readFileSync(path.resolve(__dirname, './client.html'), 'utf-8');

const port = 3000;
http.createServer((request, response) => {
  if (request.method === 'GET') {
    response.end(html);
  }
  if (request.method === 'POST') {
    console.log('received a item from client');
    let item = '';
    request.on('data', (chunk) => {
      item += chunk.toString();
    });
    request.on('end', () => {
      console.log('printing...');
      memobird.init()
        .then(() => memobird.print(item))
        .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
        .then(printflag => (printflag === 1 ? 'printed' : 'failed'))
        .then((status) => {
          console.log(status);
          response.end(status);
        });
    });
  }
}).listen(3000, () => {
  console.log(`open http://localhost:${port}`);
});
