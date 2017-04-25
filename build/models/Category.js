"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.CategorySchema = new mongoose_1.Schema({
    cateName: String,
    state: Boolean,
    createDate: String
});
var CategoryModel = mongoose_1.model('Category', exports.CategorySchema);
exports.default = CategoryModel;
