"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function route(_a) {
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
exports.route = route;
//# sourceMappingURL=route.js.map