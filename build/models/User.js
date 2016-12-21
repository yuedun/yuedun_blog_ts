const mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    mobiles: String,
    weather: String,
    createAt: String,
});
var UserSchema = new mongoose_1.Schema({
    mobiles: String,
    weather: String,
    createAt: String
});
var UserModel = mongoose_1.model('User', UserSchema);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UserModel;
//# sourceMappingURL=User.js.map