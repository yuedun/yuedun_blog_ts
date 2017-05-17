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
var debug = Debug('yuedun:index');
var blog_model_1 = require("../models/blog-model");
var qiniu_1 = require("../utils/qiniu");
var route_1 = require("../utils/route");
var settings_1 = require("../settings");
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req) {
        return blog_model_1.default.findOne()
            .then(function (data) {
            console.log(JSON.stringify(data));
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
                return Promise.resolve({
                    success: 1,
                    message: "",
                    url: settings_1.qiniuConfig.url + data.key
                });
            });
        });
    };
    return Routes;
}());
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
exports.default = Routes;
//# sourceMappingURL=index.js.map