"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
exports.default = mongoose.model('LogId', {
    updateAt: Date,
    lastLogId: Number
});
//# sourceMappingURL=LogId.js.map