"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.BlogSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    createDate: String,
    updateTime: String,
    content: { type: String, required: true },
    status: {
        type: Number,
        default: 1
    },
    comments: [],
    category: {
        type: String,
        default: ''
    },
    top: Number,
    tags: String,
    pv: Number,
    ismd: Number
}, { validateBeforeSave: true });
var BlogModel = mongoose_1.model('Blog', exports.BlogSchema);
exports.default = BlogModel;
//# sourceMappingURL=blog-model.js.map