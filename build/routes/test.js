var path = require('path');
console.log('dir:', __dirname + __filename, '\n');
console.log('process.cwd():', process.cwd());
console.log(path.relative('/home/huo/zmwork/yuedun_ts/routes', 'test.js'));
