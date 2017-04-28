'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
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
            var apiFile = routeFiles_1[_i];
            var apiModule = require(apiFile);
            var basePath = '/' + Path.relative(routerFileDir, apiFile)
                .replace(/\\/g, '/')
                .replace(this.jsExtRegex, '');
            var RouteClass = apiModule.default;
            if (RouteClass && RouteRegister.__DecoratedRouters.length > 0) {
            }
        }
    }
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
    RouteRegister.prototype.attach = function () {
    };
    return RouteRegister;
}());
RouteRegister.__DecoratedRouters = [];
exports.default = RouteRegister;
//# sourceMappingURL=route-register.js.map