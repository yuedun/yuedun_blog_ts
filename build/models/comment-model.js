"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.CommentSchema = new mongoose_1.Schema({
    bldgId: String,
    content: String,
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
var CommentModel = mongoose_1.model('Comment', exports.CommentSchema);
exports.default = CommentModel;
//# sourceMappingURL=comment-model.js.map