var mongoose = require('mongoose');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('User', {
    username: String,
    password: String,
    nickname: String,
    level: Number,
    state: Boolean,
    createDate: String
});
//# sourceMappingURL=User.js.map