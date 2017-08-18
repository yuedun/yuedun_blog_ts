'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var async = require("async");
var _ = require("lodash");
var schedule = require("node-schedule");
var http = require("http");
var settings = require("../settings");
var sms = require("./sms");
var weather_user_model_1 = require("../models/weather-user-model");
var WeatherCron = function () {
    this.h_rule = 7;
    this.m_rule = 35;
    this.cron = function () {
        console.log("天气定时任务启动");
        async.waterfall([
            function (callback) {
                weather_user_model_1.default.find({ status: 1 }, null, { sort: { _id: -1 } }, function (err, docs) {
                    callback(null, docs);
                });
            },
            function (mobiles, callback) {
                var cityGroup = _.groupBy(mobiles, "cityCode");
                _.forEach(cityGroup, function (umObjs, cityCode) {
                    var options = {
                        hostname: 'service.envicloud.cn',
                        port: 8082,
                        path: '/v2/weatherforecast/' + settings.weather_key + '/' + cityCode,
                        method: 'GET'
                    };
                    var resStr = "";
                    var myReq = http.request(options, function (result) {
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
    var mobileArray = _.chain(umObjs).map(function (o) {
        return o.mobile;
    }).value();
    var mobilesStr = mobileArray.join(";");
    console.log("手机串：", mobilesStr);
    var weatherAll = weatherObjs;
    var weatherToday = weatherAll[0];
    var weatherTomorrow = weatherAll[1];
    var msg = "\u4ECA\u5929" + weatherToday.date + "," + weatherToday.tmp.min + "\u00B0C-" + weatherToday.tmp.max + "\u00B0C," + weatherToday.wind.sc + "\u7EA7" + weatherToday.wind.dir + weatherToday.cond.cond_d + "\n    \t\u660E\u5929" + weatherTomorrow.date + "," + weatherTomorrow.tmp.min + "\u00B0C-" + weatherTomorrow.tmp.max + "\u00B0C," + weatherTomorrow.wind.sc + "\u7EA7" + weatherTomorrow.wind.dir + weatherTomorrow.cond.cond_d;
    sms.sendSMS(mobilesStr, msg, function (err, resStr) {
        console.log("短信发送完成", msg);
        callback(null, "succece");
    });
}
var cronMap = new Array();
cronMap.push(WeatherCron);
module.exports = function () {
    if (process.env.BAE_ENV_AK) {
        console.log(">>>>>>>>>>cron", process.env.BAE_ENV_AK);
        cronMap.forEach(function (Cron, key) {
            var rule = new schedule.RecurrenceRule();
            var cronObj = new Cron();
            rule.hour = cronObj.h_rule;
            rule.minute = cronObj.m_rule;
            schedule.scheduleJob(rule, cronObj.cron);
        });
    }
};
//# sourceMappingURL=cron.js.map