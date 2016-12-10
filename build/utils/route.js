const cover_1 = require('./cover');
function route(config) {
    return (target, name) => {
        cover_1.default.__DecoratedRouters.push([{
                path: config.path,
                method: config.method
            }, target[name]]);
    };
}
exports.route = route;
function adminRoute(config) {
    return (target, name) => {
        cover_1.default.__DecoratedRouters.push([{
                path: "/admin" + config.path,
                method: config.method
            }, target[name]]);
    };
}
exports.adminRoute = adminRoute;
//# sourceMappingURL=route.js.map