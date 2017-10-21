/**
 * 原生路由
 */
import {Request, Response} from "express";
import * as express from "express";

var router = express.Router();

//谷歌验证
router.get('/google4a302d2a96242bba.html', function (req, res, next) {
    res.render('google4a302d2a96242bba.html');
});

//robots.txt
router.get('/robots.txt', function (req, res, next) {
    res.sendFile("/robots.txt", {root: "./"});
});

module.exports = router;
