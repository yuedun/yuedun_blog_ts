/**
 * Created by huopanpan on 2014/5/26.
 */
export var mongodb = {
    cookieSecret: 'node-blog',
    db: 'blogs',
    port: '27017',//8908
    uid: 'admin' || process.env.BAE_ENV_AK,
    pwd: 'admin' || process.env.BAE_ENV_SK,
    host: 'localhost'
};

//建周短信账户
export var SMS_ACCOUNT = {
    account: 'xxx',
    password: 'xxx',
    signature: '【hp】',
    code: 9382
};

//环境云key http://www.envicloud.cn/
export var weather_key = "sdf==";

//主机配置
export var host = "localhost:3000";

export var gallery_pass = "123";//婚纱照访问密码，格式：gallery/?pass=123
//leacloud
export var LEACLOUD = {
    appId: '',
    appKey: ''
};

//七牛key
export var qiniuConfig = {
    url: 'http://hopefully.qiniudn.com/',
    bucketName: 'xxx',
    accessKey: '6CG6fskhgir---',
    secretKey: 'NxeiNiysdog---'
}

//微信APPSECRET
export var weixin = {
    appId: "wxcd",
    secret: "7c9d",
}