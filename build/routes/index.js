"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var formidable = require("formidable");
var Debug = require("debug");
var HttpRequest = require("request");
var debug = Debug('yuedun:index');
var blog_model_1 = require("../models/blog-model");
var qiniu_1 = require("../utils/qiniu");
var route_1 = require("../utils/route");
var settings_1 = require("../settings");
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req) {
        return blog_model_1.default.find({ status: 1 }, null, { sort: { '_id': -1 }, skip: 0, limit: 2 })
            .then(function (data) {
            debug(JSON.stringify(data));
            return data;
        });
    };
    Routes.uploadImg = function (req, res, next) {
        debug(">>>>>>>>>>>>>upload");
        var token = qiniu_1.uptoken(settings_1.qiniuConfig.bucketName);
        var form = new formidable.IncomingForm();
        return new Promise(function (resolve, reject) {
            form.parse(req, function (err, fields, files) {
                if (!err) {
                    resolve(files['editormd-image-file']);
                }
                else {
                    reject(err);
                }
            });
        }).then(function (files) {
            var file = files.path;
            var file_name = files.name;
            return qiniu_1.uploadFile(file, file_name, token)
                .then(function (data) {
                return {
                    success: 1,
                    message: "上传成功",
                    url: settings_1.qiniuConfig.url + data.key
                };
            });
        }).catch(function (err) {
            return {
                success: 0,
                message: err,
            };
        });
    };
    Routes.lagouPosition = function (req, res) {
        var args = req.query;
        console.log(">>>>>>>>", args);
        return new Promise(function (resolve, reject) {
            HttpRequest.get('https://m.lagou.com/search.json', {
                qs: {
                    city: args.city,
                    positionName: args.positionName,
                    pageNo: 1,
                    pageSize: 1
                },
                json: true,
                headers: {
                    cookie: '_ga=GA1.2.868381298.1568425609; user_trace_token=20190914094652-86535ba6-d691-11e9-91c2-525400f775ce; LGUID=20190914094652-86535ea3-d691-11e9-91c2-525400f775ce; LG_LOGIN_USER_ID=331375a513278b48052a1b5822f918477bb64f55e874649e; LG_HAS_LOGIN=1; _gid=GA1.2.413117961.1579144546; Hm_lvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1579144546; _ga=GA1.3.868381298.1568425609; Hm_lvt_2f04b07136aeba81b3a364fd73385ff4=1579144546; X_MIDDLE_TOKEN=b8a17d6cd73affcd17491c0c816e9140; JSESSIONID=ABAAAECAAHHAAFD2A02AE4D689659CC281B4B4E986F2CBB; _gat=1; Hm_lpvt_4233e74dff0ae5bd0a3d81c6ccf756e6=1579159461; LGSID=20200116152422-37dcb732-3831-11ea-b2e7-525400f775ce; PRE_UTM=; PRE_HOST=; PRE_SITE=https%3A%2F%2Fm.lagou.com%2Futrack%2FtrackMid.html%3Ff%3Dhttps%253A%252F%252Fm.lagou.com%252Fsearch.html%26t%3D1579159462%26_ti%3D1; PRE_LAND=https%3A%2F%2Fm.lagou.com%2Fsearch.html; LGRID=20200116152422-37dcb8f0-3831-11ea-b2e7-525400f775ce; X_HTTP_TOKEN=d19f45b7e2f1b8bd3649519751f18b54668ac30637; Hm_lpvt_2f04b07136aeba81b3a364fd73385ff4=1579159462',
                    host: 'm.lagou.com',
                    referer: 'https://m.lagou.com/search.html',
                    "user-agent": 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
                }
            }, function (err, res) {
                if (err) {
                    reject(new Error(err.message));
                    return;
                }
                console.log(JSON.stringify(res.body));
                resolve(res.body);
            });
        });
    };
    __decorate([
        route_1.route({
            json: true
        })
    ], Routes, "index", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "uploadImg", null);
    __decorate([
        route_1.route({
            method: "get",
            json: true
        })
    ], Routes, "lagouPosition", null);
    return Routes;
}());
exports.default = Routes;
//# sourceMappingURL=index.js.map