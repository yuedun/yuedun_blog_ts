/**
 * Created by huopanpan on 2014/10/11.
 */
var express = require('express');
var weixin = express.Router();
var interfaceWX = require('../models/weixin/InterfaceWeixin');
weixin.get('/weixin/validateToken', function(req, res){
    interfaceWX.validateToken(req, res);
});
module.exports = weixin;