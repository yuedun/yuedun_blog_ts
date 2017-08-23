'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var viewer_log_model_1 = require("../models/viewer-log-model");
var blog_model_1 = require("../models/blog-model");
function default_1(req) {
    var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var realIp = req.headers['x-forwarded-for'];
    if (req.headers['referer'] && req.headers['user-agent']) {
        if (realIp) {
            realIp = realIp.substring(0, realIp.indexOf(','));
        }
        else {
            realIp = ip;
        }
        if (req.originalUrl.lastIndexOf("blogdetail/") > 0) {
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
    }
}
exports.default = default_1;
//# sourceMappingURL=viewer-log.js.map