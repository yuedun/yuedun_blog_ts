var async = require('async');
var express = require('express');
var router = express.Router();
var Blog = require('../models/Blog');
var qiniu = require('../utils/qiniu');
var token = qiniu.uptoken('hopefully');
var md = require('markdown-it')();
var config = require('../settings').blog_config;
router.get('/index2', function (req, res) {
    var pageIndex = 1;
    var pageSize = 10;
    pageIndex = req.query.pageIndex == undefined ? pageIndex : req.query.pageIndex;
    pageSize = req.query.pageSize == undefined ? pageSize : req.query.pageSize;
    var category = req.query.category;
    var condition = {
        status: 1,
        category: ""
    };
    if (category != "" && category != null) {
        condition.category = category;
    }
    async.parallel([
        function (callback) {
            Blog.find(condition, null, {
                sort: { '_id': -1 },
                skip: (pageIndex - 1) * pageSize,
                limit: pageSize
            }, function (err, docs) {
                if (err)
                    res.send(err.message);
                docs.forEach(function (item, index) {
                    item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                });
                callback(null, docs);
            });
        },
        function (callback) {
            Blog.find({ 'status': 1 }, null, { sort: { '_id': -1 }, limit: 5 }, function (err, docs2) {
                if (err)
                    res.send(err.message);
                callback(null, docs2);
            });
        },
        function (callback) {
            Blog.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err, docs3) {
                if (err)
                    res.send(err.message);
                callback(null, docs3);
            });
        }
    ], function (err, result) {
        if (err)
            res.send(err.message);
        res.render('index2', {
            config: config,
            blogList: result[0],
            newList: result[1],
            topList: result[2],
            pageIndex: pageIndex,
            pageSize: pageSize,
            pageCount: result[0].length,
            category: category
        });
    });
});
router.get('/blog', function (req, res) {
    res.render('blog');
});
router.get('/cate', function (req, res) {
    res.render('cate');
});
router.get('/quicknote2', function (req, res) {
    res.render('quicknote2');
});
router.get('/weibo2', function (req, res) {
    res.render('weibo2');
});
router.get('/about2', function (req, res) {
    res.render('about2');
});
router.get('/up', function (req, res) {
    qiniu.uploadFile('/home/huo/Pictures/104432cjc7c8tx7xxqqkgq.jpg', '104432cjc7c8tx7xxqqkgq.jpg', token);
    res.send('上传成功');
});
router.get('/md', function (req, res) {
    res.render('md');
});
router.post('/tohtml', function (req, res) {
    var result = md.render(req.body.mdcontent);
    console.log(">>>>>>>", result);
    res.render('tohtml', { html: result });
});
module.exports = router;
//# sourceMappingURL=index2.js.map