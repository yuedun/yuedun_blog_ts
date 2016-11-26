const mongoose_1 = require('mongoose');
var WeatherLogSchema = new mongoose_1.Schema({
    mobiles: String,
    weather: String,
    createAt: String,
});
var WeatherLogSchema = new mongoose_1.Schema({
    mobiles: String,
    weather: String,
    createAt: String
});
var WeatherLogModel = mongoose_1.model('WeatherLog', WeatherLogSchema);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WeatherLogModel;
//# sourceMappingURL=WeatherLog.js.map