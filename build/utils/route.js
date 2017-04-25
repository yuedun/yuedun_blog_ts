"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cover_1 = require("./cover");
function route(config) {
    var method = config.method ? config.method : "get";
    return function (target, name) {
        cover_1.default.__DecoratedRouters.push([{
                path: config.path,
                method: method
            }, target[name]]);
    };
}
exports.route = route;
function adminRoute(config) {
    return function (target, name) {
        cover_1.default.__DecoratedRouters.push([{
                path: "/admin" + config.path,
                method: config.method
            }, target[name]]);
    };
}
exports.adminRoute = adminRoute;
