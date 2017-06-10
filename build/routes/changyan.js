"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var http = require('http');
var utils = require('utility');
var moment = require('moment');
var nodemailer = require('nodemailer');
var comment_model_1 = require("../models/comment-model");
var route_1 = require("../utils/route");
var Routes = (function () {
    function Routes() {
    }
    Routes.changyanCallback = function (req) {
        var comment = new comment_model_1.default({
            blogId: "",
            content: req.body.data,
            status: true
        });
        return Promise.resolve(comment.save());
    };
    ;
    return Routes;
}());
__decorate([
    route_1.route({
        method: "post",
        json: true
    })
], Routes, "changyanCallback", null);
exports.default = Routes;
//# sourceMappingURL=changyan.js.map