/**
 * Created by huopanpan on 2014/5/26.
 */
export const mongodb = {
    cookieSecret: 'node-blog',
    db: 'blogs',
    port: '27017',
    uid: 'admin' || process.env.BAE_ENV_AK,
    pwd: 'admin' || process.env.BAE_ENV_SK,
    host: 'localhost'
};

//建周短信账户
export const SMS_ACCOUNT = {
    account: 'xxx',
    password: 'xxx',
    signature: '【hp】',
    code: 9382
};

//环境云key http://www.envicloud.cn/
export const weather_key = "sdf==";

export const gallery_pass = "123";//格式：gallery/?pass=123
//leacloud
export const LEACLOUD = {
    appId: '',
    appKey: ''
};

//七牛key
export const qiniuConfig = {
    url: 'http://hopefully-img.yuedun.wang/',
    bucketName: 'xxx',
    accessKey: '6CG6fskhgir---',
    secretKey: 'NxeiNiysdog---'
}

//微信APPSECRET
export const weixin = {
    appId: "wxcd",
    secret: "7c9d",
}

//发送邮件服务
export const mail = {
    from: "xx@163.com",
    pass: "xx"
}

//错误发送至
export const errorAlert = "xx@163.com";

//黑名单
export const blockIP = [];