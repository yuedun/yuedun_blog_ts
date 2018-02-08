import * as express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';
import * as http from 'http';
import * as favicon from 'serve-favicon';//图标组件由static-favicon改为serve-favicon
import * as logger from 'morgan';//此模块及以下部分模块由express分离出来
import * as cookieParser from 'cookie-parser';
// import * as bodyParser from 'body-parser';
var bodyParser = require('body-parser')
import * as ejs from 'ejs';
import * as session from 'express-session';
import * as mongoStore from 'connect-mongo';
var MongoStore = mongoStore(session);//connect-mongo(session),mongoose(orm)
import MongoConnection from './utils/connection';
const connection = new MongoConnection();
import * as settins from './settings';
var mongodb = settins.mongodb;
(require('./utils/cron'))();//定时任务
import { default as pvLog } from './utils/viewer-log';//访问日志
import RouteRegister from './utils/route-register';
var originRoutes = require('./routes/origin-routes');
import Message from "./utils/message";
var debug = require('debug')('yuedun:app.ts');
var app = express();
var store = new MongoStore({
    // autoRemove: 'native',//自动清除过期session
    mongooseConnection: connection.mongoose.connection
});

// view engine setup环境变量设置
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.renderFile);
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public/images/favicon2.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '3mb'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));//浏览器可以直接访问public下的资源
app.use(session({
    secret: mongodb.cookieSecret,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 14, httpOnly: false },//14 days，客户端保存时长。将sessionid存放在cookie中1000 * 60 * 60 * 24 * 30
    store: store,
    resave: false,//true会重新保存cookie的过期时间
    saveUninitialized: true
}));

app.use('/', originRoutes);
app.use('/*', function (req, res, next) {
    if (req.originalUrl.indexOf('/admin') === -1) {
        pvLog(req);
    }
    next();
});

/**
 * 后台动态显示用户登录状态
 * 前台放在前面不进行验证
 * 未登录状态下跳转到登录页面，点击登录时（此时还未登录）不对“/doLogin”进行验证直接转交给下一个路由。
 * 如果是登录状态则直接转交给下一个路由
 **/
app.use('/admin', function (req, res, next) {
    if (!req.session.user) {
        if (req.url == "/doLogin") {
            next();
            return;
        }
        res.render('admin/login');
    } else if (req.session.user) {
        next();
    }
});
//需要方法body-parser后面，否则无法解析post提交的body内容
const routeRegister = new RouteRegister(app, "routes");

// catch 404 and forward to error handler
// this middleware will be executed for every request to the app
//加next每个请求都会经过，不加next所有请求不会通过，没有交给下一个路由
// error handlers
// 报错时会执行
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err: any, req: Request, res: Response, next: Function) {
        console.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err: any, req: Request, res: Response, next: Function) {
    var msg = new Message(settins.errorAlert, `错误提醒`, null, err.message);
    msg.send().then(data => {
        debug(">>>>>", data)
    })
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

export { app };
