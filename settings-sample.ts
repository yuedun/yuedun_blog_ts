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

export var gallery_pass = "123";//婚纱照访问密码，格式：gallery/123
//leacloud
export var LEACLOUD = {
    appId: '',
    appKey: ''
};
//博客信息，个人基本信息配置
export var blog_config = {
    nickname:'月盾',
    job:'NodeJs',
    addr:'上海',
    tel:'1870****527',
    email:'huo.win.n@gmail.com',

    resume:'本博客即由nodejs开发。虽然很多人对js这么语言表现出不屑的态度，但它的确是一门优秀的语言，不论在前端还是服务端都有它的身影，并且有不俗的表现。',
    current_job:'nodejs。'
};
//七牛key
export var qiniuConfig = {
    url: 'http://hopefully.qiniudn.com/',
    bucketName: 'xxx',
    accessKey: '6CG6fskhgir---',
    secretKey: 'NxeiNiysdog---'
}
