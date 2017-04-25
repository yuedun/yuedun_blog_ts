"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var LogIdSchema = new mongoose_1.Schema({
    updateAt: Date,
    lastLogId: Number
});
var LogIdModel = mongoose_1.model('LogId', LogIdSchema);
exports.default = LogIdModel;
//# sourceMappingURL=LogId.js.map