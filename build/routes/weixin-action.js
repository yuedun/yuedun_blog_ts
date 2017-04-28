"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Express = require("express");
var weixin = Express.Router();
var interfaceWX = require('../models/weixin/InterfaceWeixin');
weixin.get('/weixin/validateToken', function (req, res) {
    interfaceWX.validateToken(req, res);
});
module.exports = weixin;
//# sourceMappingURL=weixin-action.js.map