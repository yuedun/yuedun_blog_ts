/**
 * 原生路由
 */
import { Request, Response } from "express";
import * as express from "express";
import * as path from "path";
import * as weixin from "../models/weixin/InterfaceWeixin"

var router = express.Router();

//谷歌验证
router.get('/google4a302d2a96242bba.html', function (req, res, next) {
    res.render('google4a302d2a96242bba.html');
});
//神马验证
router.get('/shenma-site-verification.txt', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../shenma-site-verification.txt'));
});

//微信token验证
router.get('/weixin/validateToken', function (req: Request, res: Response) {
    weixin.validateToken(req, res);
});
//获取微信token
router.get('/weixin/getToken', function (req: Request, res: Response) {
    weixin.getAccessToken(function (err, data) {
        res.send(data);
    });
    // res.send("data");
});
module.exports = router;
