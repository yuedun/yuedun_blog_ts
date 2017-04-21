'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var moment = require("moment");
var querystring = require("querystring");
var WeatherLog_1 = require("../models/WeatherLog");
var settings = require("../settings");
var SMS_ACCOUNT = settings.SMS_ACCOUNT;
exports.sendSMS = function (mobiles, text, callback) {
    var postData = querystring.stringify({
        'account': SMS_ACCOUNT.account,
        'password': SMS_ACCOUNT.password,
        'destmobile': mobiles,
        'msgText': text + SMS_ACCOUNT.signature,
        'sendDateTime': ''
    });
    var options = {
        hostname: 'www.jianzhou.sh.cn',
        port: 80,
        path: '/JianzhouSMSWSServer/http/sendBatchMessage',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    var resStr = "";
    var myReq = http.request(options, function (result) {
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