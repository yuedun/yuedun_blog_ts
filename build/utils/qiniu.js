"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStream = exports.uploadFile = exports.uploadBuf = exports.uptoken = void 0;
var qiniu = require("qiniu");
var settings_1 = require("../settings");
var mac = new qiniu.auth.digest.Mac(settings_1.qiniuConfig.accessKey, settings_1.qiniuConfig.secretKey);
var config = new qiniu.conf.Config({ zone: qiniu.zone.Zone_z0 });
exports.uptoken = function uptoken(bucketname, callbackUrl, callbackBody) {
    var options = {
        scope: bucketname,
        callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
        callbackBodyType: 'application/json',
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
};
exports.uploadBuf = function (body, key, uploadToken) {
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    formUploader.put(uploadToken, key, body, putExtra, function (respErr, respBody, respInfo) {
        console.log(respBody, respInfo);
        if (respErr) {
            console.log(respErr);
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            console.log(respBody);
        }
        else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
};
exports.uploadFile = function (localFile, key, uploadToken) {
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    return new Promise(function (resolve, reject) {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            }
            else {
                resolve(respBody);
            }
        });
    });
};
exports.uploadStream = function uploadBuf(body, key, uploadToken) {
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    var readableStream = body;
    return new Promise(function (resolve, reject) {
        formUploader.putStream(uploadToken, key, readableStream, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                console.log(respBody);
            }
            else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });
    });
};
//# sourceMappingURL=qiniu.js.map