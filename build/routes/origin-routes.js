"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
router.get('/google4a302d2a96242bba.html', function (req, res, next) {
    res.render('google4a302d2a96242bba.html');
});
router.get('/robots.txt', function (req, res, next) {
    res.sendFile("/robots.txt", { root: "./" });
});
module.exports = router;
//# sourceMappingURL=origin-routes.js.map