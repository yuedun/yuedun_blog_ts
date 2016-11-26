'use strict';
const http = require('http');
const moment = require('moment');
const querystring = require('querystring');
const WeatherLog_1 = require('../models/WeatherLog');
const settings = require('../settings');
const SMS_ACCOUNT = settings.SMS_ACCOUNT;
exports.sendSMS = function (mobiles, text, callback) {
    let postData = querystring.stringify({
        'account': SMS_ACCOUNT.account,
        'password': SMS_ACCOUNT.password,
        'destmobile': mobiles,
        'msgText': text + SMS_ACCOUNT.signature,
        'sendDateTime': ''
    });
    let options = {
        hostname: 'www.jianzhou.sh.cn',
        port: 80,
        path: '/JianzhouSMSWSServer/http/sendBatchMessage',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    let resStr = "";
    let myReq = http.request(options, function (result) {
        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            resStr += chunk;
        }).on("end", function () {
            var weathLog = new WeatherLog_1.default({
                mobiles: mobiles,
                weather: text,
                createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
            weathLog.save(function (e, docs, numberAffected) {
                callback(null, resStr);
            });
        });
    });
    myReq.on('error', function (e) {
        console.log(JSON.stringify(e));
        callback(e, "");
    });
    myReq.write(postData);
    myReq.end();
};
//# sourceMappingURL=sms.js.map