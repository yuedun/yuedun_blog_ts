import * as express from 'express';
import * as Promise from 'bluebird';
import { Request, Response } from 'express';
import { newRoute as route } from '../utils/route';

export default class Routes {

    @route({
        path: "/",
        method: "get"
    })
    static default(req: Request): Promise.Thenable<any> {
        console.log(">>>>>>>>>>>>>default");
        return Promise.resolve(">>>>>>>>>>>>>>>>>>>>>>>>default");
    }

    @route({
        path: "/index",
        method: "get"
    })
    static index(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>index");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>index")
    }
}
