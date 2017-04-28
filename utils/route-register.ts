'use strict'
import * as express from 'express';
import { Express, Router } from 'express';
import * as Fs from 'fs';
import * as Path from 'path';
import * as IO from './Io';

const router = express.Router();
const cwd = process.cwd();

export default class RouteRegister {
    static __DecoratedRouters: Array<[{path: string, method: string}, Function | Function[]]> = [];
    private router: Router;
    private app: Express;
    private jsExtRegex = /\.js$/;
    constructor(app: Express, module: string) {
        this.router = router;
        this.app = app;
        var routerFileDir = Path.resolve(cwd, module);//获取路由文件目录
        var routeFiles = IO.listFiles(routerFileDir, this.jsExtRegex);
        for (var apiFile of routeFiles) {
            var apiModule = require(apiFile);
            
            var basePath = '/' + Path.relative(routerFileDir, apiFile)
                .replace(/\\/g, '/')
                .replace(this.jsExtRegex, '');

            var RouteClass = apiModule.default;
            
            if (RouteClass && RouteRegister.__DecoratedRouters.length > 0) {
                // this.registerRouters()
                //new RouteRegister类的时候就执行
            }
        }
    }
    // TODO 实现自动路由，不需要再指定path参数，直接根据函数名来生成路由
    registerRouters() {
        for (let [config, controller] of RouteRegister.__DecoratedRouters) {
            let controllers = Array.isArray(controller) ? controller : [controller]
            controllers.forEach((controller) => this.router[config.method](config.path, controller))
        }
        this.app.use(this.router)
    }
    private attach(){
        
    }
}