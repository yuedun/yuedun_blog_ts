"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
var a = 6;
var b = 1;
var c = 2;
module.exports = router;
