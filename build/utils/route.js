"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var route_register_1 = require("./route-register");
function route(_a) {
    var path = _a.path, _b = _a.method, method = _b === void 0 ? "get" : _b;
    return function (target, name) {
        route_register_1.default.__DecoratedRouters.push([{
                path: path,
                method: method
            }, target[name]]);
    };
}
exports.route = route;
function adminRoute(_a) {
    var path = _a.path, _b = _a.method, method = _b === void 0 ? "get" : _b;
    return function (target, name) {
        route_register_1.default.__DecoratedRouters.push([{
                path: "/admin" + path,
                method: method
            }, target[name]]);
    };
}
exports.adminRoute = adminRoute;
function newRoute(_a) {
    var path = _a.path, _b = _a.method, method = _b === void 0 ? "get" : _b;
    return function (target, name) {
        method = method.toLowerCase();
        target.methods = target.methods || [];
        target.methods.push({
            target: target,
            name: name,
            handler: target[name],
            path: path,
            method: method
        });
    };
}
exports.newRoute = newRoute;
//# sourceMappingURL=route.js.map