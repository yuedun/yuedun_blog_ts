"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ResumeSchema = new mongoose_1.Schema({
    nickname: String,
    job: String,
    addr: String,
    tel: Number,
    email: Boolean,
    resume: String
});
var ResumeModel = mongoose_1.model('Resume', ResumeSchema);
exports.default = ResumeModel;
//# sourceMappingURL=resume.model.js.map