"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var qiniu = require('qiniu');
var Promise = require("bluebird");
var settings_1 = require("../settings");
qiniu.conf.ACCESS_KEY = settings_1.qiniuConfig.accessKey;
qiniu.conf.SECRET_KEY = settings_1.qiniuConfig.secretKey;
exports.uptoken = function (bucketName, callbackUrl, callbackBody) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketName);
    putPolicy.getFlags(putPolicy);
    return putPolicy.token();
};
exports.downloadUrl = function (domain, key) {
    var baseUrl = qiniu.rs.makeBaseUrl(domain, key);
    var policy = new qiniu.rs.GetPolicy();
    return policy.makeRequest(baseUrl);
};
exports.uploadBuf = function (body, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    qiniu.io.put(uptoken, key, body, extra, function (err, ret) {
        if (!err) {
            console.log(ret.key, ret.hash);
        }
        else {
            console.log(err);
        }
    });
};
exports.uploadFile = function (localFile, key, uptoken, callback) {
    var extra = new qiniu.io.PutExtra();
    return new Promise(function (resolve, reject) {
        qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
            if (!err) {
                console.log(ret.key, ret.hash);
                resolve({ key: ret.key, hash: ret.hash });
                callback && callback(null, ret);
                return;
            }
            else {
                console.log(err);
                reject(err);
                callback && callback(err);
                return;
            }
        });
    });
};
//# sourceMappingURL=qiniu.js.map