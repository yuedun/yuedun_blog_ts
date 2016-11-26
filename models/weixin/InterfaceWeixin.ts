/**
 * Created by huopanpan on 2014/10/10.
 */
import * as crypto from 'crypto';
/**
 * 验证token
 * @param req
 * @param res
 */
function validateToken(req, res) {
    var query = req.query;
    var signature = query.signature;//微信服务器加密字符串
    var echostr = query.echostr;//随机字符串
    var timestamp = query['timestamp'];//时间戳
    var nonce = query.nonce;//nonce
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = "hale";//这里填写你的token
    oriArray.sort();
    var original = oriArray[0]+oriArray[1]+oriArray[2];
    console.log("Original Str:"+original);
    console.log("signature:"+signature);
    var scyptoString = sha1(original);//将三个参数拼接加密字符串，并与服务器发送的字符串对比
    if (signature == scyptoString) {
        res.send(echostr);
    }
    else {
        res.send("Bad Token!");
    }
}

/**
 * sha1加密
 * @param str
 * @returns {*}
 */
function sha1(str) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
/**
 * 重新获取access_token
 * @type {validateToken}
 */
function getAccessToken(){
    var appid = "";
    var appsecret = "";
    var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxdec38c03e93cd4e8&secret=ba19fa2a324780addde9818d889bb1b1";

}
exports.validateToken = validateToken;