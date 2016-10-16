'use strict';
var express = require('express');
var router = express.Router();
var Cover = (function () {
    function Cover(app) {
        this.router = router;
        this.app = app;
    }
    Cover.prototype.registerRouters = function () {
        var _this = this;
        console.log("retoures:", Cover.__DecoratedRouters);
        var _loop_1 = function(config, controller) {
            var controllers = Array.isArray(controller) ? controller : [controller];
            controllers.forEach(function (controller) { return _this.router[config.method](config.path, controller); });
        };
        for (var _i = 0, _a = Cover.__DecoratedRouters; _i < _a.length; _i++) {
            var _b = _a[_i], config = _b[0], controller = _b[1];
            _loop_1(config, controller);
        }
        this.app.use(this.router);
    };
    Cover.__DecoratedRouters = [];
    return Cover;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cover;
//# sourceMappingURL=cover.js.map