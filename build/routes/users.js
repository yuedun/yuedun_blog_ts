"use strict";
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
var a = 6;
var b = 1;
var c = 2;
module.exports = router;
//# sourceMappingURL=users.js.map