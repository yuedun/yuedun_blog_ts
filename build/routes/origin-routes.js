"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var weixin = require("../models/weixin/InterfaceWeixin");
var router = express.Router();
router.get('/google4a302d2a96242bba.html', function (req, res, next) {
    res.render('google4a302d2a96242bba.html');
});
router.get('/shenma-site-verification.txt', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../shenma-site-verification.txt'));
});
router.get('/weixin/validateToken', function (req, res) {
    weixin.validateToken(req, res);
});
router.get('/weixin/getToken', function (req, res) {
    weixin.getAccessToken(function (err, data) {
        res.send(data);
    });
});
module.exports = router;
//# sourceMappingURL=origin-routes.js.map