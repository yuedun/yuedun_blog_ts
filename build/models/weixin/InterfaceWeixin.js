"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = exports.validateToken = void 0;
var crypto = require("crypto");
var HttpRequest = require("request");
var Debug = require("debug");
var debug = Debug('yuedun:weixin');
var settings_1 = require("../../settings");
function validateToken(req, res) {
    var query = req.query;
    var signature = query.signature;
    var echostr = query.echostr;
    var timestamp = query['timestamp'];
    var nonce = query.nonce;
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = "hale";
    var original = oriArray.sort().join('');
    debug(">>>>>>>>ori:", signature);
    var sha1String = sha1(original);
    debug(">>>>>>>>now:", sha1String);
    if (signature == sha1String) {
        res.send(echostr);
    }
    else {
        res.send("Bad Token!");
    }
}
exports.validateToken = validateToken;
function sha1(str) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
function getAccessToken(callback) {
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + settings_1.weixin.appId + "&secret=" + settings_1.weixin.secret;
    var chunk = "";
    HttpRequest.get(url, { json: true }, function (err, resp, body) {
        if (err) {
            callback(err);
        }
        debug(">>", body);
        callback(null, body);
    });
}
exports.getAccessToken = getAccessToken;
//# sourceMappingURL=InterfaceWeixin.js.map