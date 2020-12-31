'use strict';
import * as http from 'http';
import * as Promise from 'bluebird';
import { Request, Response } from 'express';
import * as sms from '../utils/sms';
import * as settings from '../settings';
import { route } from '../utils/route';
var SMS_ACCOUNT = settings.SMS_ACCOUNT;

export default class Routes {

    //发送短信
    @route({
        path: "/sendmsg",
    })
    static sendmsg(req: Request, res: Response): Promise.Thenable<any> {
        if (req.query.code = SMS_ACCOUNT.code) {
            return new Promise((resove, reject) => {
                sms.sendSMS(<string>req.query.mobile, <string>req.query.text, (err: any, result: any) => {
                    if (err) {
                        reject(err);
                    }
                    resove({ code: result });
                })
            })
        } else {
            return Promise.resolve({ code: "code error" });
        }
    }

    //获取余额
    @route({
        path: "/balance",
        json: true
    })
    static balance(req: Request, res: Response): Promise.Thenable<any> {
        return new Promise((resove, reject) => {
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
                    resove({
                        status: 'ok',
                        msg: "剩余" + resStr.substring(resStr.indexOf("<remainFee>") + 11, resStr.indexOf("</remainFee>")) + "条"
                    })
                })
            });
            myReq.on('error', function (e) {
                reject({ status: 'err' + e })
            });
            myReq.write("");
            myReq.end();
        })
    }
}