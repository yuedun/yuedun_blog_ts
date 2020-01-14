"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function route(_a) {
    var path = _a.path, _b = _a.method, method = _b === void 0 ? "get" : _b, _c = _a.json, json = _c === void 0 ? false : _c;
    return function (target, name) {
        method = method.toLowerCase();
        target.methods = target.methods || [];
        target.methods.push({
            target: target,
            name: name,
            handler: target[name],
            path: path,
            method: method,
            json: json
        });
    };
}
exports.route = route;
var RedirecPage = (function () {
    function RedirecPage(url) {
        this.url = url;
    }
    return RedirecPage;
}());
exports.RedirecPage = RedirecPage;
//# sourceMappingURL=route.js.map