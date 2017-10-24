/**
 * Created by huopanpan on 2014/10/10.
 */
import * as crypto from 'crypto';
import { Request as RequestExpress, Response as ResponseExpress } from 'express';
import * as HttpRequest from 'request';
import * as Debug from 'debug';
var debug = Debug('yuedun:weixin');
import { weixin as weixinConfig } from '../../settings';

/**
 * 验证token
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
export function validateToken(req: RequestExpress, res: ResponseExpress) {
    var query = req.query;
    var signature = query.signature;//微信服务器加密字符串
    var echostr = query.echostr;//随机字符串
    var timestamp = query['timestamp'];//时间戳
    var nonce = query.nonce;
    var oriArray = new Array();
    oriArray[0] = nonce;
    oriArray[1] = timestamp;
    oriArray[2] = "hale";//token微信配置中的token
    var original = oriArray.sort().join('');//字典排序,拼接成字符串
    debug(">>>>>>>>ori:", signature);
    var sha1String = sha1(original);
    debug(">>>>>>>>now:", sha1String);

    if (signature == sha1String) {
        res.send(echostr);
    } else {
        res.send("Bad Token!");
    }
}

/**
 * sha1加密
 * 
 * @param {string} str 
 * @returns 
 */
function sha1(str: string) {
    var md5sum = crypto.createHash('sha1');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
}
/**
 * 重新获取access_token
 * 
 */
export function getAccessToken(callback) {
    let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${weixinConfig.appId}&secret=${weixinConfig.secret}`;
    let chunk = "";
    HttpRequest.get(url, { json: true }, (err, resp, body) => {
        if (err) {
            callback(err)
        }
        debug(">>",body)
        callback(null, body);
    })
}
