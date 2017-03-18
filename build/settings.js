exports.mongodb = {
    cookieSecret: 'node-blog',
    db: 'blogs',
    port: '27017',
    uid: 'admin' || process.env.BAE_ENV_AK,
    pwd: 'admin' || process.env.BAE_ENV_SK,
    host: 'localhost'
};
exports.SMS_ACCOUNT = {
    account: 'sdk_handouer',
    password: 'lofti@2014',
    signature: '【霍潘】',
    code: 963852
};
exports.weather_key = "EXVLZHVUMTQ3NDYXNZE2NTY0NG==";
exports.host = "http://yuedun.duapp.com";
exports.blog_config = {
    nickname: '月盾',
    addr: '上海',
    tel: '1870****527',
    email: 'huo.win.n@gmail.com',
    resume: '本博客即由nodejs开发。虽然很多人对js这么语言表现出不屑的态度，但它的确是一门优秀的语言，不论在前端还是服务端都有它的身影，并且有不俗的表现。有些技术渐渐被遗忘，有些新技术却充满了我的生活。',
    job: '掌门1对1，nodejs。'
};
exports.qiniuKey = {
    bucketName: 'hopefully',
    accessKey: '6CG6fo8XjOhLV-z7g9a-RdfntNFqFEuhTMil-3vy',
    secretKey: 'NxeiNiy1DATcwu_BBrYQCb8GxVREalSHZi7hSzJ9'
};
//# sourceMappingURL=settings.js.map