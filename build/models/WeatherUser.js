var mongoose = require('mongoose');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('WeatherUser', {
    username: String,
    mobile: String,
    city: String,
    cityCode: Number,
    createAt: String,
    sendCount: Number,
    status: Number,
});
//# sourceMappingURL=WeatherUser.js.map