var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');//图标组件由static-favicon改为serve-favicon
var logger = require('morgan');//此模块及以下部分模块由express分离出来
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var moment = require('moment');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);//connect-mongo(session),mongoose(orm)
var connection = require('./models/connection');
connection.getConnect();//执行其中的方法。另外还有mongoose对象，用作session的公用连接
var settins = require('./settings');
var mongodb = settins.mongodb;
(require('./utils/cron'))();//定时任务
var admin = require('./routes/admin');//导入后台管理
var blog = require('./routes/blogAction');//导入博客管理
var weixin = require('./routes/weixinAction');//导入博客管理
var duoshuo = require('./routes/duoshuo');//导入博客管理
var index2 = require('./routes/index2');//测试路由
var message = require('./routes/message');//发送短信
import {default as pvLog } from './utils/viewerLog';//访问日志
import Cover from './utils/cover';
var app = express();
const cover = new Cover(app);
var store = new MongoStore({
//    url:"mongodb://"+mongodb.uid+":"+mongodb.pwd+"@"+mongodb.host+":"+mongodb.port+"/"+mongodb.db,
    interval: 60000, // expiration check worker run interval in millisec (default: 60000)
    mongooseConnection: connection.mongoose.connection // <== custom connection
});

// view engine setup环境变量设置
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname,'public/images/favicon2.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true,
    limit: '3mb'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//浏览器可以直接访问public下的资源
app.use(session({
    secret:mongodb.cookieSecret,
    //key: mongodb.db,//cookie name
    //cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store:store,
    resave:true,
    saveUninitialized:true
}));

//需要密码验证
//app.use(session({
//    secret:mongodb.cookieSecret,
//    store: new MongoStore({
//        url:"mongodb://"+mongodb.uid+":"+mongodb.pwd+"@"+mongodb.host+":"+mongodb.port+"/"+mongodb.db
//    })
//}));
app.use('/*', function(req, res, next){    
    if(req.originalUrl.indexOf('/admin') === -1){
        pvLog(req);
    }
    next();
});

cover.registerRouters();
// app.use(blog);//前台博客内容的路由添加到app
// app.use(weixin);//添加路由-后台登陆-添加博客
// app.use(duoshuo);//添加路由-后台登陆-添加博客
// app.use(index2);//添加路由-后台登陆-添加博客
// app.use(message);
/**
 * 后台动态显示用户登录状态
 * 前台放在前面不进行验证
 * 未登录状态下跳转到登录页面，点击登录时（此时还未登录）不对“/doLogin”进行验证直接转交给下一个路由。
 * 如果是登录状态则直接转交给下一个路由
 **/
app.use('/admin', function(req, res, next){
    if(req.cookies['autologin']){
        next();
        return;
    }
    if (!req.session.user) {
        if(req.url == "/doLogin"){
            next();
            return;
        }
        res.render('admin/login');
    }else if (req.session.user) {
        next();
    }
});
app.use('/admin', admin);//添加路由-后台登陆-添加博客
// catch 404 and forward to error handler
// this middleware will be executed for every request to the app
//加next每个请求都会经过，不加next所有请求不会通过，没有交给下一个路由
/*添加路由*/
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    // err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
