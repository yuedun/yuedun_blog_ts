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
        var commentObj = JSON.parse(req.body.data);
        var comment = new comment_model_1.default({
            sourceid: commentObj.sourceid,
            title: commentObj.title,
            url: commentObj.url,
            ttime: commentObj.ttime,
            metadata: commentObj.metadata,
            comments: [{
                    apptype: commentObj.comments[0].apptype,
                    attachment: commentObj.comments[0].attachment,
                    channelid: commentObj.comments[0].channelid,
                    channeltype: commentObj.comments[0].channeltype,
                    cmtid: commentObj.comments[0].cmtid,
                    content: commentObj.comments[0].content,
                    ctime: commentObj.comments[0].ctime,
                    from: commentObj.comments[0].from,
                    ip: commentObj.comments[0].ip,
                    opcount: commentObj.comments[0].opcount,
                    referid: commentObj.comments[0].referid,
                    replyid: commentObj.comments[0].replyid,
                    score: commentObj.comments[0].score,
                    spcount: commentObj.comments[0].spcount,
                    status: commentObj.comments[0].status,
                    user: {
                        nickname: commentObj.comments[0].user.nickname,
                        sohuPlusId: commentObj.comments[0].user.sohuPlusId,
                        usericon: commentObj.comments[0].user.usericon
                    },
                    useragent: commentObj.comments[0].useragent
                }]
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