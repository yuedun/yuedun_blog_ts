'use strict'
import * as express from 'express';
import * as Promise from 'bluebird';
import { Express, Router, Request, Response } from 'express';
import * as Fs from 'fs';
import * as Path from 'path';
import * as IO from './Io';
import Message from "../utils/message";
import { errorAlert } from '../settings';
var debug = require('debug')('yuedun:route-register');

const router = express.Router();
const cwd = process.cwd();

export interface RouteInfo {
    target: any;
    name: string;
    handler: Function;
    path: string;
    method: string;
    json: boolean;
}
interface ROUTE {
    methods?: RouteInfo[];
}
export default class RouteRegister {
    private app: Express;
    private jsExtRegex = /\.js$/;
    private htmlExtRegex = /\.html$/;
    private adminHtmlPath = "admin";
    private articleHtmlPath = "article";
    /**
     * 路由注册
     * @param app 
     * @param module 指定注册哪个目录下的路由
     */
    constructor(app: Express, module: string) {
        this.app = app;
        var routerFileDir = Path.resolve(cwd, module);//获取路由文件目录
        var routeFiles = IO.listFiles(routerFileDir, this.jsExtRegex);
        //获取目录下每一个路由文件
        for (var routeFile of routeFiles) {
            var routeModule = require(routeFile);

            var basePath = '/' + Path.relative(routerFileDir, routeFile)
                .replace(/\\/g, '/')
                .replace(this.jsExtRegex, '');

            var RouteClass: ROUTE = routeModule.default;//获取路由文件中的类，再根据类获取静态函数
            if (RouteClass && RouteClass.methods) {
                for (var route of RouteClass.methods) {
                    this.attach(basePath, route);
                }
            }
        }
    }
    private attach(basePath: string, route: RouteInfo): void {
        var expressMethod: Function = (<any>this.app)[route.method];
        let methodName = route.name;
        let methodPath = route.path;//? route.path: ("/" + methodName);
        let path: string;
        //面向用户端地址兼容以前的地址，特别处理
        if (basePath === "/article") {
            //没有配置path的情况
            if (!methodPath) {
                //方法名为index则为首页
                if (methodName == "index") {
                    path = "/";
                } else {
                    path = "/" + methodName;
                }
            } else if (typeof methodPath === 'string') {
                if (methodPath.charAt(0) != '/') {//例如：/index/:id则path只需配置为:id
                    path = '/' + methodName + '/' + methodPath;
                } else {
                    //自定义path，例如：/a/b/c，不需要符合/article/about这种规则。如果指定了path则以path为最终路由
                    path = methodPath;
                }
            }
        } else {
            //下面的匹配方式更符合自动路由
            if (!methodPath) {
                //方法名为index则为首页
                if (methodName == "index") {
                    path = basePath;
                } else {
                    path = basePath + "/" + methodName;
                }
            } else if (typeof methodPath === 'string') {
                if (methodPath.charAt(0) != '/') {//例如：/index/:id则path只需配置为:id
                    path = basePath + '/' + methodName + '/' + methodPath;
                } else {
                    //自定义path，例如：/a/b/c，不需要符合/article/about这种规则
                    path = methodPath;
                }
            }
        }

        /**
         * 每个路由都会构造出一个app.get或app.post这样的函数
         * 然后调用这个函数，传递地址和回调函数
         */
        expressMethod.call(this.app, path, (req: Request, res: Response) => {
            new Promise((resolve, reject) => {
                //可以做一些预处理
                resolve("权限验证通过");
            }).then(data => {
                //获取到数据可以做一些后续补充处理
                return route.handler.call(route.target, req, res);
            }).then(data => {
                if (!data) {
                    console.warn("没有数据返回，或许是路由中重定向或render")
                    return;
                }//没有返回数据，一般是redirect跳转了，不需要往下执行。也可以返回需要重定向的地址，在此统一处理
                // if(typeof data == "string"){
                //     res.redirect(data);
                //     return;
                // }
                if (data instanceof Error) {
                    res.render('error', {
                        message: data.message,
                        error: {}
                    });
                    return;
                }

                //可以添加类似于全局变量的返回数据
                if (!data.title) {
                    data.title = "";
                }
                if (route.json) {
                    res.json(data);
                    return;
                }
                if (basePath === "/admin") {
                    let html = this.adminHtmlPath + "/" + methodName;
                    res.render(html, data);
                } else {
                    let html = this.articleHtmlPath + "/" + methodName;
                    res.render(html, data);
                }
            }).catch((err: Error) => {
                let errMsg = `【访问url】：${req.url}，【错误堆栈】：${err.stack}`
                var msg = new Message(errorAlert, `错误提醒`, null, errMsg)
                msg.send().then(data => {
                    debug(">>>>>", data)
                })
                res.render('error', {
                    message: err.message,
                    error: {}
                });
            })
        })
    }
}