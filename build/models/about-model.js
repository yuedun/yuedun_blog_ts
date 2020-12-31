"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var IAboutSchema = new mongoose_1.Schema({
    nickname: String,
    job: String,
    addr: String,
    tel: String,
    email: String,
    resume: String,
    other: String,
});
var IAboutModel = mongoose_1.model('About', IAboutSchema);
exports.default = IAboutModel;
//# sourceMappingURL=about-model.js.map