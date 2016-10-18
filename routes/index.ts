import * as express from 'express';
import {route} from '../utils/route';
export class Routes {

    @route({
        path: "/",
        method: "get"
    })
    static default(req, res, next): any {
        console.log(">>>>>>>>>>>>>default");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>default")
        
    }
    @route({
        path: "/index",
        method: "get"
    })
    static index(req, res, next): any {
        console.log(">>>>>>>>>>>>>index");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>index")
    }
    @route({
        path: "/home",
        method: "get"
    })
    static home(req, res, next): any {
        console.log(">>>>>>>>>>>>>home");
        res.send(">>>>>>>>>>>>>>>>>>>>>>>>home")
    }
}
