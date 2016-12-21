'use strict';
const express = require("express");
const router = express.Router();
class Cover {
    constructor(app) {
        this.router = router;
        this.app = app;
    }
    registerRouters() {
        for (let [config, controller] of Cover.__DecoratedRouters) {
            let controllers = Array.isArray(controller) ? controller : [controller];
            controllers.forEach((controller) => this.router[config.method](config.path, controller));
        }
        this.app.use(this.router);
    }
}
Cover.__DecoratedRouters = [];
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Cover;
//# sourceMappingURL=cover.js.map