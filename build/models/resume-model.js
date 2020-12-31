"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ResumeSchema = new mongoose_1.Schema({
    state: Number,
    content: String,
    bakup: String,
}, { timestamps: true });
var ResumeModel = mongoose_1.model('Resume', ResumeSchema);
exports.default = ResumeModel;
//# sourceMappingURL=resume-model.js.map