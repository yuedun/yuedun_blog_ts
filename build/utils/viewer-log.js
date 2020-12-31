'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIP = void 0;
var moment = require("moment");
var viewer_log_model_1 = require("../models/viewer-log-model");
var blog_model_1 = require("../models/blog-model");
function default_1(req) {
    var realIp = getIP(req);
    if (/\/blogdetail/.test(req.originalUrl)) {
        var blogId_1 = req.originalUrl.substring(req.originalUrl.lastIndexOf("/") + 1);
        blog_model_1.default.findById(blogId_1)
            .then(function (blog) {
            var pvLogObj = new viewer_log_model_1.default({
                ip: realIp,
                blogId: blogId_1,
                title: blog.title,
                url: req.originalUrl,
                referer: req.headers['referer'] || '',
                userAgent: req.headers['user-agent'] || '',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
            return pvLogObj.save();
        }).then(function () {
            console.log("访问记录成功！");
        });
    }
    else if (/\/catalog/.test(req.originalUrl)
        || /\/quicknote/.test(req.originalUrl)
        || /\/weibo/.test(req.originalUrl)
        || /\/message/.test(req.originalUrl)
        || /\/about/.test(req.originalUrl)) {
        var pvLogObj = new viewer_log_model_1.default({
            ip: realIp,
            url: req.originalUrl,
            referer: req.headers['referer'] || '',
            userAgent: req.headers['user-agent'] || '',
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        return pvLogObj.save();
    }
}
exports.default = default_1;
function getIP(req) {
    var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var realIp = req.headers['x-forwarded-for'];
    if (req.headers['referer'] && req.headers['user-agent']) {
        if (realIp) {
            realIp = realIp.substring(0, realIp.indexOf(','));
        }
        else {
            realIp = ip;
        }
    }
    return realIp;
}
exports.getIP = getIP;
//# sourceMappingURL=viewer-log.js.map