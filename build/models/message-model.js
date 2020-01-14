"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.Mychema = new mongoose_1.Schema({
    content: String,
    ip: String,
    replyid: String,
    status: Number,
    nickname: String,
    email: String,
    usericon: String,
    useragent: String,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true });
var CommentModel = mongoose_1.model('Message', exports.Mychema);
exports.default = CommentModel;
//# sourceMappingURL=message-model.js.map