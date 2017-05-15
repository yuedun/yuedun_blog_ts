import * as Promise from 'bluebird';
import * as Debug from 'debug';
var debug = Debug('yuedun:index');
import { Request, Response } from 'express';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { route } from '../utils/route';

export default class Routes {

    @route({
        json: true
    })
    static index(req: Request): Promise.Thenable<any> {
        return Blog.findOne()
            .then(data => {
                console.log(JSON.stringify(data))
                return data;
            });
    }

    @route({
        json: true
    })
    static test1(req: Request, res: Response, next: Function): any {
        console.log(">>>>>>>>>>>>>test1");
        return Promise.resolve(">>>>>>>>>>>>test")
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
