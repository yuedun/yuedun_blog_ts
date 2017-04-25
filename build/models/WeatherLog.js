"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
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
exports.default = WeatherLogModel;
