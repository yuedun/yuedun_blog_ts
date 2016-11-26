'use strict';
var async = require('async');
var _ = require('lodash');
var schedule = require("node-schedule");
var http = require('http');
var settings = require('../settings');
var connection = require('../models/connection');
import * as sms from'./sms';
var WeatherUser = require('../models/WeatherUser');

var WeatherCron = function () {
    // this.m_rule = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];//数字或数组
    // this.m_rule = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 59];//数字或数组
    this.h_rule = 7;//每天7点
    this.m_rule = 35;
    this.cron = function () {
        console.log("天气定时任务启动")
        async.waterfall([
            function (callback) {
                //获取需要发送的手机号队列
                WeatherUser.find({ 'status': 1 }, null, { sort: { '_id': -1 } }, function (err, docs) {
                    //手机号和对应和要查询的城市
                    callback(null, docs);
                });
            },
            function (mobiles, callback) {
                let cityGroup = _.groupBy(mobiles, "cityCode");//按照城市分组
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
                            console.log(">>>>>>>>>>>",w)
                            if(w[0].cond.cond_d.indexOf("雨")>-1){
                                sendSms(w, umObjs, callback);
                            }
                        })
                    }).on('error', function (e) {
                        console.log(">>>err:", e)
                    });
                    myReq.write("");
                    myReq.end();
                })
            }
        ], function (err, result) {
            console.log(result);
        });
    }
}
//发送短信
function sendSms(weatherObjs, umObjs, callback) {
    let mobileArray = _.chain(umObjs).map(function (o) {
        return o.mobile
    }).value();
    let mobilesStr = mobileArray.join(";");//这样的字符串13996396369;13659865896
    console.log("手机串：", mobilesStr);
    let weatherAll = weatherObjs;
    let weatherToday = weatherAll[0];//今天
    let weatherTomorrow = weatherAll[1];//明天
    let msg = `今天${weatherToday.date},${weatherToday.tmp.min}°C-${weatherToday.tmp.max}°C,${weatherToday.wind.sc}级${weatherToday.wind.dir}${weatherToday.cond.cond_d}
    	明天${weatherTomorrow.date},${weatherTomorrow.tmp.min}°C-${weatherTomorrow.tmp.max}°C,${weatherTomorrow.wind.sc}级${weatherTomorrow.wind.dir}${weatherTomorrow.cond.cond_d}`;
    sms.sendSMS(mobilesStr, msg, function (err, resStr) {
        console.log("短信发送完成", msg);
        callback(null, "succece");
    });
}
//定时请求本服务，防止mongodb断开链接
var ReqCron = function () {
    this.m_rule = [1, 11, 21, 31, 41, 51];
    this.cron = function () {
        console.log("请求定时任务启动")
        var myReq = http.request(settings.host, function (result) {
            console.log('request yuedun');
        });
        myReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            connection.getConnect();
        });
        myReq.end();
    }
}

var cronMap = new Map();
cronMap.set("weather_cron", WeatherCron);
cronMap.set("req_cron", ReqCron);

//定时任务
module.exports = function () {
    cronMap.forEach(function (Cron, key) {
        let rule = new schedule.RecurrenceRule();
        let cronObj = new Cron();
        rule.hour = cronObj.h_rule;
        rule.minute = cronObj.m_rule;
        schedule.scheduleJob(rule, cronObj.cron);
    });
}
