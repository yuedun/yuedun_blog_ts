import * as express from 'express';
import * as Promise from 'bluebird';
import { Request, Response } from 'express';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { route } from '../utils/route';

export default class Routes {

    @route({
        path: "/",
        json: true
    })
    static index(req: Request): Promise.Thenable<any> {
        console.log(">>>>>>>>>>>>>default");
        return Blog.findOne()
        .then(data=>{
            console.log(JSON.stringify(data))
            return data;
        })
        // return Promise.resolve(">>>>>>>>>>>>>>>>>>>>>>>>default");
    }

    @route({
        
    })
    static test1(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>index");
        // res.send(">>>>>>>>>>>>>>>>>>>>>>>>index")
        return Promise.resolve(">>>>>>>>>>>>index")
    }

    /**
     * 手机发布
     * @param req 
     * @param res 
     * @param next 
     */
    @route({
        
    })
    static test2(req: Request): any {
        console.log(">>>>>>>>>>>>>index");
        // res.send(">>>>>>>>>>>>>>>>>>>>>>>>index")
        return Promise.resolve(">>>>>>>>>>>>index")
    }
}
