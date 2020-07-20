/**
 * Created by huopanpan on 2014/10/22.
 */
import * as qiniu from 'qiniu';
import { qiniuConfig } from '../settings';

// init
const mac = new qiniu.auth.digest.Mac(qiniuConfig.accessKey, qiniuConfig.secretKey);
const config = new qiniu.conf.Config({ zone: qiniu.zone.Zone_z0 });

// uptoken获取token
export var uptoken = function uptoken(bucketname: string, callbackUrl?: string, callbackBody?: any) {
    let options = {
        scope: bucketname,
        // callbackUrl: callbackUrl,
        callbackBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
        callbackBodyType: 'application/json',

    };
    let putPolicy = new qiniu.rs.PutPolicy(options);//只传递一个参数实际上是scope(bucket),其余参数暂不指定
    let uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
}

/**
 * 服务端上传时使用
 */
export const uploadBuf = function (body: any, key: string, uploadToken: string) {
    let formUploader = new qiniu.form_up.FormUploader(config);
    let putExtra = new qiniu.form_up.PutExtra();
    formUploader.put(uploadToken, key, body, putExtra, function (respErr, respBody, respInfo) {
        console.log(respBody, respInfo);

        if (respErr) {
            // 上传失败， 处理返回代码
            console.log(respErr)
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            console.log(respBody);
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
}
/**
 * 服务端上传文件
 * @param localFile文件地址
 * @param key
 * @param uptoken
 */
export const uploadFile = function (localFile: string, key: string, uploadToken: string): Promise<any> {
    let formUploader = new qiniu.form_up.FormUploader(config);
    let putExtra = new qiniu.form_up.PutExtra();
    // 文件上传
    return new Promise((resolve, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                reject(respErr);
            } else {
                resolve(respBody);
            }
        });
    })
}

// 数据流上传（表单方式）
export const uploadStream = function uploadBuf(body: NodeJS.ReadableStream, key: string, uploadToken: string): Promise<any> {
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    var readableStream = body; // 可读的流
    return new Promise((resolve, reject) => {
        formUploader.putStream(uploadToken, key, readableStream, putExtra, function (respErr,
            respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                console.log(respBody);
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });
    })
}