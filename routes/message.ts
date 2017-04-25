'use strict';
import * as http from 'http';
import * as express from 'express';
import { Request, Response } from 'express';
var router = express.Router;
import * as querystring from 'querystring';
import * as errmsg from '../utils/error-code';
import * as sms from '../utils/sms';
import * as settings from '../settings';
import {route} from '../utils/route';
var SMS_ACCOUNT = settings.SMS_ACCOUNT;

export class Routes {

    //发送短信
    @route({
        path: "/sendmsg",
        method: "get"
    })
    static sendmsg(req: Request, res: Response) {
        if (req.query.code = SMS_ACCOUNT.code) {
            sms.sendSMS(req.query.mobile, req.query.text, (err:any, result:any) => {
                res.render('sms', { code: result });
            })
        } else {
            res.render('sms', { code: "code error" });
        }
    }

    //获取余额
    @route({
        path: "/balance",
        method: "get"
    })
    static balance(req: Request, res: Response) {
        let options = {
            hostname: 'www.jianzhou.sh.cn',
            port: 80,
            path: '/JianzhouSMSWSServer/http/getUserInfo?account=' + SMS_ACCOUNT.account + '&password=' + SMS_ACCOUNT.password,
            method: 'GET'
        };
        let resStr = "";
        let myReq = http.request(options, function (result) {
            result.setEncoding('utf8');
            result.on('data', function (chunk) {
                resStr += chunk;
            }).on("end", function () {
                res.send({
                    status: 'ok',
                    msg: "剩余" + resStr.substring(resStr.indexOf("<remainFee>") + 11, resStr.indexOf("</remainFee>")) + "条"
                });
            })
        });
        myReq.on('error', function (e) {
            res.send({ status: 'err' + e });
        });
        myReq.write("");
        myReq.end();
    }
    
    @route({
        path: "/sms",
        method: "get"
    })
    static sms(req: Request, res: Response) {
        res.render('sms', { code: "" });
    }
}