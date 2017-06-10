/**
 * Created by huopanpan on 2017/6/10.
 */
import * as Promise from 'bluebird';
import { Request, Response } from 'express';
var http = require('http');
var utils = require('utility');
var moment = require('moment');
var nodemailer = require('nodemailer');
import { default as Comment, IComment as CommentInstance } from '../models/comment-model';
import { route } from '../utils/route';

export default class Routes {
    /**
     * 畅言评论同步到本地
     * @param params
     * @param callback
     */
    @route({
        method:"post",
        json: true
    })
    static changyanCallback(req: Request) {
        let comment = new Comment({
            blogId: "",
            content: req.body.data,
            status: true
        });
        return Promise.resolve(comment.save())
    };
}

