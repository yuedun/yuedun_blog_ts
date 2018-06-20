'use strict';
import * as moment from 'moment';
import { Request, Response } from 'express';
import { default as ViewerLogModel } from '../models/viewer-log-model';
import BlogModel from '../models/blog-model';

/**
 * params req 路由的request参数
 */
export default function (req: Request) {
    var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var realIp = req.headers['x-forwarded-for'];
    if (req.headers['referer'] && req.headers['user-agent']) {
        if (realIp) {
            realIp = realIp.substring(0, realIp.indexOf(','))
        } else {
            realIp = ip;
        }
        if (/\/blogdetail/.test(req.originalUrl)) {
            const blogId = req.originalUrl.substring(req.originalUrl.lastIndexOf("/") + 1);
            BlogModel.findById(blogId)
                .then(blog => {
                    var pvLogObj = new ViewerLogModel({
                        ip: realIp,
                        blogId,
                        title: blog.title,
                        url: req.originalUrl,
                        referer: req.headers['referer'] || '',
                        userAgent: req.headers['user-agent'] || '',
                        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                    });
                    return pvLogObj.save();
                }).then(() => {
                    console.log("访问记录成功！");
                })
        } else if (/\/catalog/.test(req.originalUrl)
            || /\/quicknote/.test(req.originalUrl)
            || /\/weibo/.test(req.originalUrl)
            || /\/about/.test(req.originalUrl)) {
            var pvLogObj = new ViewerLogModel({
                ip: realIp,
                url: req.originalUrl,
                referer: req.headers['referer'] || '',
                userAgent: req.headers['user-agent'] || '',
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
            return pvLogObj.save();
        }
    }
}
