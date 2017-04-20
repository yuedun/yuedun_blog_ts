'use strict'
import * as express from 'express';
import { Express } from 'express';

const router = express.Router();

export default class Cover {

    static __DecoratedRouters: Array<[{path: string, method: string}, Function | Function[]]> = [];
    private router: any;
    private app: Express;
    constructor(app: Express) {
        this.router = router;
        this.app = app;
    }

    registerRouters() {
        for (let [config, controller] of Cover.__DecoratedRouters) {
            let controllers = Array.isArray(controller) ? controller : [controller]
            controllers.forEach((controller) => this.router[config.method](config.path, controller))
        }
        this.app.use(this.router)
    }
}