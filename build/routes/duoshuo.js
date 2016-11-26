var async = require('async');
var express = require('express');
var http = require('http');
var utils = require('utility');
var moment = require('moment');
var nodemailer = require('nodemailer');
var router = express.Router();
var LogId = require('../models/LogId');
var Blog = require('../models/Blog');
var secret = '82a854439cab3a11b334ae4c60558a78';
var short_name = 'hopefully';
router.post('/callbackComments', function (req, res) {
    if (check_signature(req, secret)) {
        var last_log_id = null;
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
                            Blog.update({ _id: comObj.meta.thread_key }, { $inc: { commentCount: 1 } }, { upsert: true }, function (err, obj) {
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
                            var html = `<a href="${comment.meta.author_url}">${comment.meta.author_name}</a>
                                    :<b>${comment.meta.message} 🐴</b>
                                    <a href="http://${req.headers.host}/blogdetail/${comment.meta.thread_key}">http://${req.headers.host}/blogdetail/${comment.meta.thread_key}</a>
                                    `;
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
});
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
router.getLastLogId = function (params, callback) {
    LogId.findById(params.id, function (err, obj) {
        callback(null, obj);
    });
};
router.updateLastLogId = function (params, callback) {
    LogId.update({ _id: params.id }, { lastLogId: params.lastLogId }, function (err, obj) {
        callback(null, obj);
    });
};
module.exports = router;
//# sourceMappingURL=duoshuo.js.map