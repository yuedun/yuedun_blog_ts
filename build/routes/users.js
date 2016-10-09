"use strict";
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
var a = 5;
module.exports = router;
//# sourceMappingURL=users.js.map