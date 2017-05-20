"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var moment = require("moment");
var formidable = require("formidable");
var Debug = require("debug");
var debug = Debug('yuedun:index');
var test_model_1 = require("../models/test-model");
var qiniu_1 = require("../utils/qiniu");
var route_1 = require("../utils/route");
var settings_1 = require("../settings");
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req) {
        var args = req.body;
        var test = new test_model_1.default({
            title: args.title
        });
        return test.save()
            .then(function (data) {
            console.log(moment(data.createdAt).format('YYYY-MM-DD HH:mm:SS'));
            return data;
        });
    };
    Routes.update = function (req) {
        var args = req.body;
        return test_model_1.default.findByIdAndUpdate('591ff41af777182524f7f2d8', {
            $set: {
                title: args.title
            }
        }).then(function (data) {
            console.log(data);
            return data;
        });
    };
    Routes.uploadImg = function (req, res, next) {
        console.log(">>>>>>>>>>>>>upload");
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
    return Routes;
}());
__decorate([
    route_1.route({
        json: true,
        method: 'post'
    })
], Routes, "index", null);
__decorate([
    route_1.route({
        json: true,
        method: 'post'
    })
], Routes, "update", null);
__decorate([
    route_1.route({
        method: "post",
        json: true
    })
], Routes, "uploadImg", null);
exports.default = Routes;
//# sourceMappingURL=index.js.map