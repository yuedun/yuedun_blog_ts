'use strict';
import * as moment from 'moment';
import {Request, Response} from 'express';
import {default as ViewerLogModel}from '../models/ViewerLog';

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
        var pvLogObj = new ViewerLogModel({
            ip: realIp,
            url: req.originalUrl,
            referer: req.headers['referer'] || '',
            userAgent: req.headers['user-agent'] || '',
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        pvLogObj.save(function (e, docs, numberAffected) {
            if (e) console.log(e);
            console.log("记录完成");
        });
    }
}
