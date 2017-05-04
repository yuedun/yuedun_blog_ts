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
        this.router = router;
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
        console.log("basePath:", basePath);
        console.log("route:", route);
        var expressMethod = this.app[route.method];
        console.log("expressMethod:", expressMethod);
        var methodName = route.name;
        var methodPath = route.path;
        var path;
        path = basePath + methodPath;
        expressMethod.call(this.app, path, function (req, res) {
            new Promise(function (resolve, reject) {
                return route.handler.call(route.target, req, res)
                    .then(function (data) {
                    res.send(data);
                });
            });
        });
    };
    RouteRegister.prototype.registerRouters = function () {
        var _this = this;
        var _loop_1 = function (config, controller) {
            var controllers = Array.isArray(controller) ? controller : [controller];
            controllers.forEach(function (controller) { return _this.router[config.method](config.path, controller); });
        };
        for (var _i = 0, _a = RouteRegister.__DecoratedRouters; _i < _a.length; _i++) {
            var _b = _a[_i], config = _b[0], controller = _b[1];
            _loop_1(config, controller);
        }
        this.app.use(this.router);
    };
    return RouteRegister;
}());
RouteRegister.__DecoratedRouters = [];
exports.default = RouteRegister;
//# sourceMappingURL=route-register.js.map