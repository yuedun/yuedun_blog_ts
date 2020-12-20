"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');
var ejs = require("ejs");
var session = require("express-session");
var mongoStore = require("connect-mongo");
var MongoStore = mongoStore(session);
var connection_1 = require("./utils/connection");
var connection = new connection_1.default();
var settins = require("./settings");
var mongodb = settins.mongodb;
(require('./utils/cron'))();
var viewer_log_1 = require("./utils/viewer-log");
var route_register_1 = require("./utils/route-register");
var originRoutes = require('./routes/origin-routes');
var message_1 = require("./utils/message");
var debug = require('debug')('yuedun:app.ts');
var app = express();
exports.app = app;
var store = new MongoStore({
    mongooseConnection: connection.mongoose.connection
});
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
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: mongodb.cookieSecret,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 14, httpOnly: false },
    store: store,
    resave: false,
    saveUninitialized: true
}));
app.use('/', originRoutes);
app.use('/*', function (req, res, next) {
    if (req.originalUrl.indexOf('/admin') === -1) {
        viewer_log_1.default(req);
    }
    next();
});
app.use('/admin', function (req, res, next) {
    if (!req.session.user) {
        if (req.url == "/doLogin") {
            next();
            return;
        }
        res.render('admin/login');
    }
    else if (req.session.user) {
        next();
    }
});
var routeRegister = new route_register_1.default(app, "routes");
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    var msg = new message_1.default(settins.errorAlert, "\u9519\u8BEF\u63D0\u9192", null, err.message);
    debug(err.message);
    msg.send().then(function (data) {
        debug(">>>>>", data);
    });
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
//# sourceMappingURL=app.js.map