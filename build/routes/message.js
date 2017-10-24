'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var Promise = require("bluebird");
var sms = require("../utils/sms");
var settings = require("../settings");
var route_1 = require("../utils/route");
var SMS_ACCOUNT = settings.SMS_ACCOUNT;
var Routes = (function () {
    function Routes() {
    }
    Routes.sendmsg = function (req, res) {
        if (req.query.code = SMS_ACCOUNT.code) {
            return new Promise(function (resove, reject) {
                sms.sendSMS(req.query.mobile, req.query.text, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resove({ code: result });
                });
            });
        }
        else {
            return Promise.resolve({ code: "code error" });
        }
    };
    Routes.balance = function (req, res) {
        return new Promise(function (resove, reject) {
            var options = {
                hostname: 'www.jianzhou.sh.cn',
                port: 80,
                path: '/JianzhouSMSWSServer/http/getUserInfo?account=' + SMS_ACCOUNT.account + '&password=' + SMS_ACCOUNT.password,
                method: 'GET'
            };
            var resStr = "";
            var myReq = http.request(options, function (result) {
                result.setEncoding('utf8');
                result.on('data', function (chunk) {
                    resStr += chunk;
                }).on("end", function () {
                    resove({
                        status: 'ok',
                        msg: "剩余" + resStr.substring(resStr.indexOf("<remainFee>") + 11, resStr.indexOf("</remainFee>")) + "条"
                    });
                });
            });
            myReq.on('error', function (e) {
                reject({ status: 'err' + e });
            });
            myReq.write("");
            myReq.end();
        });
    };
    __decorate([
        route_1.route({
            path: "/sendmsg",
        })
    ], Routes, "sendmsg", null);
    __decorate([
        route_1.route({
            path: "/balance",
            json: true
        })
    ], Routes, "balance", null);
    return Routes;
}());
exports.default = Routes;
//# sourceMappingURL=message.js.map