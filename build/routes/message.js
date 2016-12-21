'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const http = require("http");
const express = require("express");
var router = express.Router;
const sms = require("../utils/sms");
const settings = require("../settings");
const route_1 = require("../utils/route");
var SMS_ACCOUNT = settings.SMS_ACCOUNT;
class Routes {
    static sendmsg(req, res) {
        if (req.query.code = SMS_ACCOUNT.code) {
            sms.sendSMS(req.query.mobile, req.query.text, (err, result) => {
                res.render('sms', { code: result });
            });
        }
        else {
            res.render('sms', { code: "code error" });
        }
    }
    static balance(req, res) {
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
            });
        });
        myReq.on('error', function (e) {
            res.send({ status: 'err' + e });
        });
        myReq.write("");
        myReq.end();
    }
    static sms(req, res) {
        res.render('sms', { code: "" });
    }
}
__decorate([
    route_1.route({
        path: "/sendmsg",
        method: "get"
    })
], Routes, "sendmsg", null);
__decorate([
    route_1.route({
        path: "/balance",
        method: "get"
    })
], Routes, "balance", null);
__decorate([
    route_1.route({
        path: "/sms",
        method: "get"
    })
], Routes, "sms", null);
exports.Routes = Routes;
//# sourceMappingURL=message.js.map