/**
 * Created by huopanpan on 2014/10/31.
 */
var async = require('async');
var express = require('express');
import { Request, Response } from 'express';
var http = require('http');
var utils = require('utility');
var moment = require('moment');
var nodemailer = require('nodemailer');
var router = express.Router();//获取路由变量，对其设置路径，再导出在app.js中使用app.use(blog)
import { default as LogId } from '../models/LogId';
import { default as Blog } from '../models/blog-model';
import { route } from '../utils/route';
var secret = '82a854439cab3a11b334ae4c60558a78';
var short_name = 'hopefully';

export class Routes {
    //修改评论数，不同步评论数据
    @route({
        path: "/callbackComments",
        method: "get"
    })
    static callbackComments(req: Request, res: Response) {
        if (check_signature(req, secret)) {
            var last_log_id: number;//上一次同步时读到的最后一条log的ID，开发者自行维护此变量（如保存在你的数据库）
            var params: any = {
                short_name: short_name,
                secret: secret,
                since_id: last_log_id,
                limit: 1,
                order: 'desc'
            };
            if (!last_log_id) last_log_id = 0;
            params['since_id'] = last_log_id;
            var paramsStr = "?";
            for (var property in params) {
                paramsStr = paramsStr + property + "=" + params[property] + "&";
            }
            paramsStr = paramsStr.substring(0, paramsStr.lastIndexOf("&"));
            //*****************start
            var myReq = http.request('http://api.duoshuo.com/log/list.json' + paramsStr, function (result: any) {
                result.setEncoding('utf8');
                result.on('data', function (chunk: any) {
                    var comObj = JSON.parse(chunk).response[0];
                    if (comObj.action === 'create') {
                        async.waterfall([
                            function (callback: Function) {
                                //修改评论数{$inc: {wheels:1}}, { w: 1 }
                                Blog.update({ _id: comObj.meta.thread_key }, { $inc: { commentCount: 1 } }, { upsert: true }, function (err, obj) {
                                    callback(err, comObj);
                                });
                            },
                            function (comment: any, callback: Function) {
                                // create reusable transporter object using the default SMTP transport 
                                var transporter = nodemailer.createTransport({
                                    service: '163',
                                    // host: 'smtp.gmail.com',
                                    // port: 465,
                                    // secure: true, // use SSL 
                                    auth: {
                                        user: 'xxx@163.com',
                                        pass: 'xxx'
                                    }
                                });
                                var html = `<a href="${comment.meta.author_url}">${comment.meta.author_name}</a>
                                    :<b>${comment.meta.message} 🐴</b>
                                    <a href="http://${req.headers.host}/blogdetail/${comment.meta.thread_key}">http://${req.headers.host}/blogdetail/${comment.meta.thread_key}</a>
                                    `
                                // setup e-mail data with unicode symbols 
                                var mailOptions = {
                                    from: '"xxx 👥" <xxx@163.com>', // sender address 
                                    to: 'xxx@163.com', // list of receivers 
                                    subject: '多说评论 ✔', // Subject line 
                                    text: comment.meta.author_name + ":" + comment.meta.message + '🐴', // plaintext body 
                                    html: html // html body 
                                };
                                transporter.verify(function (error: any, success: any) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        // send mail with defined transport object 
                                        transporter.sendMail(mailOptions, function (error: any, info: any) {
                                            callback(error, "sendMail");
                                        });
                                    }
                                });

                            }
                        ], function (err: any, result: any) {
                            if (err) console.log(err);
                            console.log("邮件发送成功");
                            res.send('{"status":"ok","comment_id":"' + comObj.log_id + '", "action":"' + comObj.action + '"}');
                        });
                    } else {
                        res.send('{"status":"ok","comment_id":"' + comObj.log_id + '", "action":"' + comObj.action + '"}');
                    }
                });
            });
            myReq.on('error', function (e: Error) {
                console.log('problem with request: ' + e.message);
            });
            myReq.end();
            //*****************end
        } else {
            res.send('{"status":"err"}');
        }
    }

    /**
     * 获取多说评论最后一次同步id
     * @param params
     * @param callback
     */
    @route({
        path: "/getLastLogId",
        method: "get"
    })
    static getLastLogId(params: any, callback: Function) {
        LogId.findById(params.id, function (err: any, obj: any) {
            callback(null, obj);
        });
    };
    /**
     * 更新最后一条同步id
     * @param params
     * @param callback
     */
    @route({
        path: "/updateLastLogId",
        method: "get"
    })
    static updateLastLogId(params: any, callback: Function) {
        LogId.update({ _id: params.id }, { lastLogId: params.lastLogId }, function (err: any, obj: any) {
            callback(null, obj);
        });
    };
}

/**
* 检查签名
* req 请求参数
* secret 多说密匙
**/
function check_signature(req: Request, secret: string) {
    var oriArray = [];
    var signature = req.body.signature;//多说请求签名，与此签名对比
    oriArray[0] = secret;
    oriArray[1] = req.body.action;
    oriArray.sort();//字典排序
    //var original = oriArray[0]+oriArray[1];
    var scyptoString = utils.base64encode(oriArray);

    if (signature == scyptoString) {
        //console.log(signature+'相等' + scyptoString);
        return true;
    } else {
        //console.log(signature+'不相等' + scyptoString);
    }
    return true;
}
