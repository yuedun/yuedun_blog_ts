"use strict";
var cover_1 = require('./cover');
function route(config) {
    return function (target, name) {
        console.log(config.path);
        cover_1.default.__DecoratedRouters.push([{
                path: config.path,
                method: config.method
            }, target[name]]);
    };
}
exports.route = route;
//# sourceMappingURL=route.js.map