var mongoose = require('mongoose');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('Category', new mongoose.Schema({
    cateName: String,
    state: Boolean,
    createDate: String
}));
//# sourceMappingURL=Category.js.map