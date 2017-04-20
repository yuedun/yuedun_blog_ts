import * as express from 'express';
import { Request, Response } from 'express';
import { route } from '../utils/route';
export class Routes {

    @route({
        path: "/",
        method: "get"
    })
    static default(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>default");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>default")
    }

    @route({
        path: "/index",
        method: "get"
    })
    static index(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>index");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>index")
    }
    
    @route({
        path: "/home",
        method: "get"
    })
    static home(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>home");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>home")
    }
}
