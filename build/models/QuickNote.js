const mongoose_1 = require("mongoose");
var QuickNoteSchema = new mongoose_1.Schema({
    createDate: String,
    content: String,
    status: String,
});
var QuickNoteModel = mongoose_1.model('QuickNote', QuickNoteSchema);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QuickNoteModel;
//# sourceMappingURL=QuickNote.js.map