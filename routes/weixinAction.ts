/**
 * Created by huopanpan on 2014/10/11.
 */
import * as Express from 'express';
import { Request, Response } from 'express';
var weixin = Express.Router();
var interfaceWX = require('../models/weixin/InterfaceWeixin');
weixin.get('/weixin/validateToken', function (req: Request, res: Response) {
    interfaceWX.validateToken(req, res);
});
module.exports = weixin;