var path = require('path');
var debug = require('debug')('yuedun:test');
debug("test.ts文件输出");
debug('dir:', __dirname + __filename, '\n');
debug('process.cwd():', process.cwd());
debug(path.relative('/home/huo/zmwork/yuedun_ts/routes', 'test.js'));
//# sourceMappingURL=test.js.map