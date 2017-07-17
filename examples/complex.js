const Memobird = require('../');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});

memobird.init()

  .then(() => {
    const printcontentid = memobird.printText('你好咕咕机!');
    return printcontentid;
  })
  .then((printcontentid) => {
    console.log('打印内容的唯一ID:', printcontentid);
    // 3000毫秒后获取打印状态
    const printflag = memobird.glance(printcontentid, 3000);
    return printflag;
  })
  .then((printflag) => {
    if (printflag === 1) {
      console.log('打印状态:', '已打印');
    } else {
      console.log('打印状态:', '未打印');
    }
  })

  .then(() => {
    const base64 = 'Qk1eAQAAAAAAAD4AAAAoAAAAYAAAABgAAAABAAEAAAAAACABAABtCwAAbQsAAAIAAAACAAAAAAAAAP///wD///////////////////////////////8AAA/////+B/////8AAA//n//4Af//z/8AAA//n//wAP//z/8AAA//D//AAD//h/8AAA//D//AAD//h/8AAA/+B/+AAB//A/8AAA/+B/+AAB/9A/8AAA/8A/8AAA/AAA8AAA/8A/8AAA+AAAcAAA/4Af8AAA/AAB8AAA/4Af8AAA/wAD8AAA/wAP8AAA/4AH8AAA/wAP8AAA/4AH8AAA/gAH+AAB/8AP8AAA/gAH+AAB/8AH8AAA/AAD/AAD/4AP8AAA/AAD/AAH/4AH8AAA+AAB/wAH/4eH8AAA+AAB/4Af/5/n8AAA8AAA/+B//3/7////////////////////////////////8=';
    const printcontentid = memobird.printBmp(base64);
    return printcontentid;
  })
  .then((printcontentid) => {
    console.log('打印内容的唯一ID:', printcontentid);
    // 3000毫秒后获取打印状态
    const printflag = memobird.glance(printcontentid, 3000);
    return printflag;
  })
  .then((printflag) => {
    if (printflag === 1) {
      console.log('打印状态:', '已打印');
    } else {
      console.log('打印状态:', '未打印');
    }
  })

  .then(() => {
    const printcontentid = memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png', 100);
    return printcontentid;
  })
  .then((printcontentid) => {
    console.log('打印内容的唯一ID:', printcontentid);
    // 每3000毫秒获取一次打印状态，如果显示未打印则继续获取，当获取到结果为已打印的状态或总用时超出15000毫秒，则终止并返回结果
    const printflag = memobird.watch(printcontentid, 3000, 15000);
    return printflag;
  })
  .then((printflag) => {
    if (printflag === 1) {
      console.log('打印状态:', '已打印');
    } else {
      console.log('打印状态:', '未打印，监听超时');
    }
  })
  .catch(error => console.log('打印出错了：', error));
