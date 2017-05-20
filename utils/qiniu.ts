/**
 * Created by huopanpan on 2014/10/22.
 */
var qiniu = require('qiniu');
import * as Promise from 'bluebird';
import { qiniuConfig } from '../settings';

// @gist init
qiniu.conf.ACCESS_KEY = qiniuConfig.accessKey;
qiniu.conf.SECRET_KEY = qiniuConfig.secretKey;
// @endgist

// @gist uptoken获取token
export var uptoken = function (bucketName: string, callbackUrl?: string, callbackBody?: string) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName);//只传递一个参数实际上是scope(bucket)
    //putPolicy.callbackUrl = callbackUrl || null;//回调地址，即上传成功后七牛服务器调用我的服务器地址
    //putPolicy.callbackBody = callbackBody || null;//回调内容
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;//uptoken过期时间，默认3600s=1小时
    putPolicy.getFlags(putPolicy);
    return putPolicy.token();
}
// @endgist

// @gist downloadUrl
export var downloadUrl = function (domain: string, key: string) {
    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var policy = new qiniu.rs.GetPolicy();
    return policy.makeRequest(baseUrl);
}
/**
 * 服务端上传时使用
 */
export var uploadBuf = function (body: any, key: string, uptoken: string) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.put(uptoken, key, body, extra, function (err: any, ret: any) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err)
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
}
/**
 * 服务端上传文件
 * @param localFile文件地址
 * @param key
 * @param uptoken
 */
export var uploadFile = function (localFile: string, key: string, uptoken: string, callback?: Function): Promise.Thenable<any> {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;
    return new Promise((resolve, reject) => {
        qiniu.io.putFile(uptoken, key, localFile, extra, function (err: any, ret: any) {
            if (!err) {
                // 上传成功， 处理返回值
                console.log(ret.key, ret.hash);
                resolve({ key: ret.key, hash: ret.hash });
                callback && callback(null, ret); return;
                // ret.key & ret.hash
            } else {
                // 上传失败， 处理返回代码
                console.log(err);
                reject(err);
                callback && callback(err); return;
                // http://developer.qiniu.com/docs/v6/api/reference/codes.html
            }
        });
    })
}