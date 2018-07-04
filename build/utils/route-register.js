'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Promise = require("bluebird");
var Path = require("path");
var IO = require("./Io");
var message_1 = require("../utils/message");
var settings_1 = require("../settings");
var debug = require('debug')("yuedun:route-register.ts");
var router = express.Router();
var cwd = process.cwd();
var RouteRegister = (function () {
    function RouteRegister(app, module) {
        this.jsExtRegex = /\.js$/;
        this.htmlExtRegex = /\.html$/;
        this.adminHtmlPath = "admin";
        this.articleHtmlPath = "article";
        this.app = app;
        var routerFileDir = Path.resolve(cwd, module);
        var routeFiles = IO.listFiles(routerFileDir, this.jsExtRegex);
        for (var _i = 0, routeFiles_1 = routeFiles; _i < routeFiles_1.length; _i++) {
            var routeFile = routeFiles_1[_i];
            var routeModule = require(routeFile);
            var basePath = '/' + Path.relative(routerFileDir, routeFile)
                .replace(/\\/g, '/')
                .replace(this.jsExtRegex, '');
            var RouteClass = routeModule.default;
            if (RouteClass && RouteClass.methods) {
                for (var _a = 0, _b = RouteClass.methods; _a < _b.length; _a++) {
                    var route = _b[_a];
                    this.attach(basePath, route);
                }
            }
        }
    }
    RouteRegister.prototype.attach = function (basePath, route) {
        var _this = this;
        var expressMethod = this.app[route.method];
        var methodName = route.name;
        var methodPath = route.path;
        var path;
        if (basePath === "/article") {
            if (!methodPath) {
                if (methodName == "index") {
                    path = "/";
                }
                else {
                    path = "/" + methodName;
                }
            }
            else if (typeof methodPath === 'string') {
                if (methodPath.charAt(0) != '/') {
                    path = '/' + methodName + '/' + methodPath;
                }
                else {
                    path = methodPath;
                }
            }
        }
        else {
            if (!methodPath) {
                if (methodName == "index") {
                    path = basePath;
                }
                else {
                    path = basePath + "/" + methodName;
                }
            }
            else if (typeof methodPath === 'string') {
                if (methodPath.charAt(0) != '/') {
                    path = basePath + '/' + methodName + '/' + methodPath;
                }
                else {
                    path = methodPath;
                }
            }
        }
        expressMethod.call(this.app, path, function (req, res) {
            new Promise(function (resolve, reject) {
                resolve("权限验证通过");
            }).then(function (data) {
                return route.handler.call(route.target, req, res);
            }).then(function (data) {
                if (!data) {
                    console.warn("没有数据返回，或许是路由中重定向或render");
                    return;
                }
                if (data instanceof Error) {
                    res.render('error', {
                        message: data.message,
                        error: {}
                    });
                    return;
                }
                if (!data.title) {
                    data.title = "";
                }
                if (route.json) {
                    res.json(data);
                    return;
                }
                if (basePath === "/admin") {
                    var html = _this.adminHtmlPath + "/" + methodName;
                    res.render(html, data);
                }
                else {
                    var html = _this.articleHtmlPath + "/" + methodName;
                    res.render(html, data);
                }
            }).catch(function (err) {
                var errMsg = "\u3010\u8BBF\u95EEurl\u3011\uFF1A" + req.url + "\n\u3010\u9519\u8BEF\u5806\u6808\u3011\uFF1A" + err.stack;
                var msg = new message_1.default(settings_1.errorAlert, "\u9519\u8BEF\u63D0\u9192", null, errMsg);
                msg.send().then(function (data) {
                    debug(">>>>>", data);
                });
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            });
        });
    };
    return RouteRegister;
}());
exports.default = RouteRegister;
//# sourceMappingURL=route-register.js.map