"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var QuickNoteSchema = new mongoose_1.Schema({
    createDate: String,
    content: String,
    status: String,
});
var QuickNoteModel = mongoose_1.model('QuickNote', QuickNoteSchema);
exports.default = QuickNoteModel;
//# sourceMappingURL=quick-note-model.js.map