const mongoose_1 = require("mongoose");
var ViewerLogSchema = new mongoose_1.Schema({
    ip: String,
    url: String,
    referer: String,
    userAgent: String,
    createdAt: String,
});
var ViewerLogModel = mongoose_1.model('ViewerLog', ViewerLogSchema);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ViewerLogModel;
//# sourceMappingURL=ViewerLog.js.map