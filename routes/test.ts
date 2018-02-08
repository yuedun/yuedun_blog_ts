var path = require('path');
import Message from "../utils/message";
var debug = require('debug')('yuedun:test');
debug("process.env.NODE_ENV", process.env.NODE_ENV);

var html = `
   /###((\o/))####/ |
  /_____//^\\____/# |
 |       #       |# | 
 |  圣   #   快  |# |
 |  诞   #   乐  |#/
 |_______#____ __|/
                     送给你的，打开看看吧：)
        `;
// var msg = new Message("xx@163.com", `错误提醒 ✔`, null, html)
// msg.send().then(data=>{
//     debug(">>>>>", data)
// })
// debug('dir:',__dirname+__filename,'\n');
// debug('process.cwd():',process.cwd());
// debug(path.relative('/home/huo/zmwork/yuedun_ts/routes', 'test.js'));
