"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySchema = void 0;
var mongoose_1 = require("mongoose");
var moment = require("moment");
exports.CategorySchema = new mongoose_1.Schema({
    cateName: { type: String, required: true },
    state: { type: Boolean, default: true }
}, { timestamps: true });
exports.CategorySchema.virtual('newdate').get(function () {
    return moment(this.createdAt).format('YYYY-M-DD HH:mm:ss');
});
var CategoryModel = mongoose_1.model('Category', exports.CategorySchema);
exports.default = CategoryModel;
//# sourceMappingURL=category-model.js.map