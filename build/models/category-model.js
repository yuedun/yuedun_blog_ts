"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.CategorySchema = new mongoose_1.Schema({
    cateName: { type: String, required: true },
    state: { type: Boolean, default: true }
}, { timestamps: true });
var CategoryModel = mongoose_1.model('Category', exports.CategorySchema);
exports.default = CategoryModel;
//# sourceMappingURL=category-model.js.map