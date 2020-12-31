"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogSchema = void 0;
var mongoose_1 = require("mongoose");
var moment = require("moment");
exports.BlogSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: {
        type: Number,
        default: 1
    },
    comments: [],
    commentCount: Number,
    category: String,
    top: Number,
    tags: String,
    pv: Number,
    ismd: Number
}, { validateBeforeSave: true, timestamps: true });
exports.BlogSchema.virtual('createDate').get(function () {
    return moment(this.createdAt).format('YYYY-M-DD HH:mm:ss');
});
exports.BlogSchema.virtual('updateTime').get(function () {
    return moment(this.udpatedAt).format('YYYY-M-DD HH:mm:ss');
});
var BlogModel = mongoose_1.model('Blog', exports.BlogSchema);
exports.default = BlogModel;
//# sourceMappingURL=blog-model.js.map