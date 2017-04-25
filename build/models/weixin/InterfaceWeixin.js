"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
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
    oriArray.sort();
    var original = oriArray[0] + oriArray[1] + oriArray[2];
    console.log("Original Str:" + original);
    console.log("signature:" + signature);
    var scyptoString = sha1(original);
    if (signature == scyptoString) {
        res.send(echostr);
    }
    else {
        res.send("Bad Token!");
    }
}
function sha1(str) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
function getAccessToken() {
    var appid = "";
    var appsecret = "";
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxdec38c03e93cd4e8&secret=ba19fa2a324780addde9818d889bb1b1";
}
exports.validateToken = validateToken;
//# sourceMappingURL=InterfaceWeixin.js.map