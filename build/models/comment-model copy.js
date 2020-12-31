"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.CommentSchema = new mongoose_1.Schema({
    sourceid: String,
    title: String,
    url: String,
    ttime: Number,
    metadata: String,
    comments: [{
            apptype: Number,
            attachment: Array,
            channelid: Number,
            channeltype: Number,
            cmtid: String,
            content: String,
            ctime: Number,
            from: Number,
            ip: String,
            opcount: Number,
            referid: String,
            replyid: String,
            score: Number,
            spcount: Number,
            status: Number,
            user: {
                nickname: String,
                sohuPlusId: Number,
                usericon: String
            },
            useragent: String
        }]
}, { timestamps: true });
var CommentModel = mongoose_1.model('Comment', exports.CommentSchema);
exports.default = CommentModel;
//# sourceMappingURL=comment-model copy.js.map