"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
exports.WeatherUserSchema = new mongoose_1.Schema({
    username: String,
    mobile: String,
    city: String,
    cityCode: Number,
    createAt: String,
    sendCount: Number,
    status: Number,
});
var WeatherUserModel = mongoose_1.model('WeatherUser', exports.WeatherUserSchema);
exports.default = WeatherUserModel;
//# sourceMappingURL=WeatherUser.js.map