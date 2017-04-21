'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var ViewerLog_1 = require("../models/ViewerLog");
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
        var pvLogObj = new ViewerLog_1.default({
            ip: realIp,
            url: req.originalUrl,
            referer: req.headers['referer'] || '',
            userAgent: req.headers['user-agent'] || '',
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        pvLogObj.save(function (e, docs, numberAffected) {
            if (e)
                console.log(e);
            console.log("记录完成");
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=viewerLog.js.map