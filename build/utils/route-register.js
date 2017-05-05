'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Promise = require("bluebird");
var Path = require("path");
var IO = require("./Io");
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
        path = basePath + methodPath;
        expressMethod.call(this.app, path, function (req, res) {
            new Promise(function (resolve, reject) {
                resolve("权限验证通过");
            }).then(function (data) {
                return route.handler.call(route.target, req, res);
            }).then(function (data) {
                if (!data)
                    return;
                if (basePath === "/admin") {
                    var html = _this.adminHtmlPath + "/" + methodName;
                    res.render(html, data);
                }
                else {
                    var html = _this.articleHtmlPath + "/" + methodName;
                    res.render(html, data);
                }
            });
        });
    };
    return RouteRegister;
}());
exports.default = RouteRegister;
//# sourceMappingURL=route-register.js.map