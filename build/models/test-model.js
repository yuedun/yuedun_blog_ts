"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.TestSchema = new mongoose_1.Schema({
    title: String,
}, { timestamps: true });
var TestModel = mongoose_1.model('Test', exports.TestSchema);
exports.default = TestModel;
//# sourceMappingURL=test-model.js.map