exports.mongodb = {
    cookieSecret: 'node-demo',
    db: 'blogs',
    port: '8908',
    uid: 'admin' || process.env.BAE_ENV_AK,
    pwd: 'admin' || process.env.BAE_ENV_SK,
    host: 'localhost:27017'
};
exports.SMS_ACCOUNT = {
    account: 'xxx',
    password: 'xxx',
    signature: '【hp】',
    code: 9382
};
exports.weather_key = "sdf==";
exports.host = "localhost:3000";
exports.blog_config = {
    nickname: '月盾',
    job: 'NodeJs',
    addr: '上海',
    tel: '1870****527',
    email: 'huo.win.n@gmail.com',
    resume: '本博客即由nodejs开发。虽然很多人对js这么语言表现出不屑的态度，但它的确是一门优秀的语言，不论在前端还是服务端都有它的身影，并且有不俗的表现。有些技术渐渐被遗忘，有些新技术却充满了我的生活。',
    current_job: '掌门1对1，nodejs。'
};
exports.qiniuKey = {
    bucketName: 'xxx',
    accessKey: '6CG6fskhgireugiuerhg-RdfntNFqFEuhTMil-3vy',
    secretKey: 'NxeiNiysdogjsoidxxxxxxx8GxVREalSHZi7hSzJ9'
};
