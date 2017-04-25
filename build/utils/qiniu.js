"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var qiniu = require('qiniu');
var settings = require("../settings");
var secret_key = settings.qiniuKey;
qiniu.conf.ACCESS_KEY = secret_key.accessKey;
qiniu.conf.SECRET_KEY = secret_key.secretKey;
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
exports.uploadFile = function (localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
        if (!err) {
            console.log(ret.key, ret.hash);
        }
        else {
            console.log(err);
        }
    });
};
