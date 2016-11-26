'use strict';
var async = require('async');
var _ = require('lodash');
var schedule = require("node-schedule");
var http = require('http');
var settings = require('../settings');
var connection = require('../models/connection');
const sms = require('./sms');
var WeatherUser = require('../models/WeatherUser');
var WeatherCron = function () {
    this.h_rule = 7;
    this.m_rule = 35;
    this.cron = function () {
        console.log("天气定时任务启动");
        async.waterfall([
            function (callback) {
                WeatherUser.find({ 'status': 1 }, null, { sort: { '_id': -1 } }, function (err, docs) {
                    callback(null, docs);
                });
            },
            function (mobiles, callback) {
                let cityGroup = _.groupBy(mobiles, "cityCode");
                _.forEach(cityGroup, function (umObjs, cityCode) {
                    let options = {
                        hostname: 'service.envicloud.cn',
                        port: 8082,
                        path: '/v2/weatherforecast/' + settings.weather_key + '/' + cityCode,
                        method: 'GET'
                    };
                    let resStr = "";
                    let myReq = http.request(options, function (result) {
                        result.setEncoding('utf8');
                        result.on('data', function (chunk) {
                            resStr += chunk;
                        }).on("end", function () {
                            var w = JSON.parse(resStr).forecast;
                            console.log(">>>>>>>>>>>", w);
                            if (w[0].cond.cond_d.indexOf("雨") > -1) {
                                sendSms(w, umObjs, callback);
                            }
                        });
                    }).on('error', function (e) {
                        console.log(">>>err:", e);
                    });
                    myReq.write("");
                    myReq.end();
                });
            }
        ], function (err, result) {
            console.log(result);
        });
    };
};
function sendSms(weatherObjs, umObjs, callback) {
    let mobileArray = _.chain(umObjs).map(function (o) {
        return o.mobile;
    }).value();
    let mobilesStr = mobileArray.join(";");
    console.log("手机串：", mobilesStr);
    let weatherAll = weatherObjs;
    let weatherToday = weatherAll[0];
    let weatherTomorrow = weatherAll[1];
    let msg = `今天${weatherToday.date},${weatherToday.tmp.min}°C-${weatherToday.tmp.max}°C,${weatherToday.wind.sc}级${weatherToday.wind.dir}${weatherToday.cond.cond_d}
    	明天${weatherTomorrow.date},${weatherTomorrow.tmp.min}°C-${weatherTomorrow.tmp.max}°C,${weatherTomorrow.wind.sc}级${weatherTomorrow.wind.dir}${weatherTomorrow.cond.cond_d}`;
    sms.sendSMS(mobilesStr, msg, function (err, resStr) {
        console.log("短信发送完成", msg);
        callback(null, "succece");
    });
}
var ReqCron = function () {
    this.m_rule = [1, 11, 21, 31, 41, 51];
    this.cron = function () {
        console.log("请求定时任务启动");
        var myReq = http.request(settings.host, function (result) {
            console.log('request yuedun');
        });
        myReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            connection.getConnect();
        });
        myReq.end();
    };
};
var cronMap = new Map();
cronMap.set("weather_cron", WeatherCron);
cronMap.set("req_cron", ReqCron);
module.exports = function () {
    cronMap.forEach(function (Cron, key) {
        let rule = new schedule.RecurrenceRule();
        let cronObj = new Cron();
        rule.hour = cronObj.h_rule;
        rule.minute = cronObj.m_rule;
        schedule.scheduleJob(rule, cronObj.cron);
    });
};
//# sourceMappingURL=cron.js.map