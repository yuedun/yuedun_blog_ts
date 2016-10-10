"use strict";
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
    res.render('index', { title: '基于Express的typescript开发的项目,hhh' });
});
module.exports = router;
//# sourceMappingURL=index.js.map