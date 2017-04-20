"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var async = require('async');
var express = require('express');
var http = require('http');
var utils = require('utility');
var moment = require('moment');
var nodemailer = require('nodemailer');
var router = express.Router();
var LogId_1 = require("../models/LogId");
var Blog_1 = require("../models/Blog");
var route_1 = require("../utils/route");
var secret = '82a854439cab3a11b334ae4c60558a78';
var short_name = 'hopefully';
var Routes = (function () {
    function Routes() {
    }
    Routes.callbackComments = function (req, res) {
        if (check_signature(req, secret)) {
            var last_log_id;
            var params = {
                short_name: short_name,
                secret: secret,
                since_id: last_log_id,
                limit: 1,
                order: 'desc'
            };
            if (!last_log_id)
                last_log_id = 0;
            params['since_id'] = last_log_id;
            var paramsStr = "?";
            for (var property in params) {
                paramsStr = paramsStr + property + "=" + params[property] + "&";
            }
            paramsStr = paramsStr.substring(0, paramsStr.lastIndexOf("&"));
            var myReq = http.request('http://api.duoshuo.com/log/list.json' + paramsStr, function (result) {
                result.setEncoding('utf8');
                result.on('data', function (chunk) {
                    var comObj = JSON.parse(chunk).response[0];
                    if (comObj.action === 'create') {
                        async.waterfall([
                            function (callback) {
                                Blog_1.default.update({ _id: comObj.meta.thread_key }, { $inc: { commentCount: 1 } }, { upsert: true }, function (err, obj) {
                                    callback(err, comObj);
                                });
                            },
                            function (comment, callback) {
                                var transporter = nodemailer.createTransport({
                                    service: '163',
                                    auth: {
                                        user: 'xxx@163.com',
                                        pass: 'xxx'
                                    }
                                });
                                var html = "<a href=\"" + comment.meta.author_url + "\">" + comment.meta.author_name + "</a>\n                                    :<b>" + comment.meta.message + " \uD83D\uDC34</b>\n                                    <a href=\"http://" + req.headers.host + "/blogdetail/" + comment.meta.thread_key + "\">http://" + req.headers.host + "/blogdetail/" + comment.meta.thread_key + "</a>\n                                    ";
                                var mailOptions = {
                                    from: '"xxx 👥" <xxx@163.com>',
                                    to: 'xxx@163.com',
                                    subject: '多说评论 ✔',
                                    text: comment.meta.author_name + ":" + comment.meta.message + '🐴',
                                    html: html
                                };
                                transporter.verify(function (error, success) {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        transporter.sendMail(mailOptions, function (error, info) {
                                            callback(error, "sendMail");
                                        });
                                    }
                                });
                            }
                        ], function (err, result) {
                            if (err)
                                console.log(err);
                            console.log("邮件发送成功");
                            res.send('{"status":"ok","comment_id":"' + comObj.log_id + '", "action":"' + comObj.action + '"}');
                        });
                    }
                    else {
                        res.send('{"status":"ok","comment_id":"' + comObj.log_id + '", "action":"' + comObj.action + '"}');
                    }
                });
            });
            myReq.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            });
            myReq.end();
        }
        else {
            res.send('{"status":"err"}');
        }
    };
    Routes.getLastLogId = function (params, callback) {
        LogId_1.default.findById(params.id, function (err, obj) {
            callback(null, obj);
        });
    };
    ;
    Routes.updateLastLogId = function (params, callback) {
        LogId_1.default.update({ _id: params.id }, { lastLogId: params.lastLogId }, function (err, obj) {
            callback(null, obj);
        });
    };
    ;
    return Routes;
}());
__decorate([
    route_1.route({
        path: "/callbackComments",
        method: "get"
    })
], Routes, "callbackComments", null);
__decorate([
    route_1.route({
        path: "/getLastLogId",
        method: "get"
    })
], Routes, "getLastLogId", null);
__decorate([
    route_1.route({
        path: "/updateLastLogId",
        method: "get"
    })
], Routes, "updateLastLogId", null);
exports.Routes = Routes;
function check_signature(req, secret) {
    var oriArray = [];
    var signature = req.body.signature;
    oriArray[0] = secret;
    oriArray[1] = req.body.action;
    oriArray.sort();
    var scyptoString = utils.base64encode(oriArray);
    if (signature == scyptoString) {
        return true;
    }
    else {
    }
    return true;
}
