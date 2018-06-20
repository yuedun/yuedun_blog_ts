'use strict';

import * as http from 'http';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { default as WeatherLog } from '../models/weather-log-model';
import * as errmsg from '../utils/error-code';
import * as settings from '../settings';
const SMS_ACCOUNT = settings.SMS_ACCOUNT;
/**
 * mobiles string 单个或多个手机号字符串，用;分割
 * text string 发送内容
 */
export var sendSMS = function (mobiles: string, text: string, callback: Function): void {
    let postData = querystring.stringify({
        'account': SMS_ACCOUNT.account,
        'password': SMS_ACCOUNT.password,
        'destmobile': mobiles,//目标手机
        'msgText': text + SMS_ACCOUNT.signature,//签名
        'sendDateTime': ''//定时日期
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
            var weathLog = new WeatherLog({
                mobiles: mobiles,
                weather: text,
                createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
            weathLog.save(function (e, docs, numberAffected) {
                callback(null, resStr);
            });
        })
    });
    myReq.on('error', function (e) {
        console.log("发送短信异常", JSON.stringify(e));
        callback(e, "")
    });
    myReq.write(postData);
    myReq.end();
};