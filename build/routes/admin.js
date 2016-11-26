var express = require('express');
var _ = require('lodash');
var router = express.Router();
var moment = require('moment');
var async = require('async');
var User = require('../models/User');
var Blog = require('../models/Blog');
var QuickNote = require('../models/QuickNote');
var Category = require('../models/Category');
var WeatherUser = require('../models/WeatherUser');
var qiniu = require('../utils/qiniu');
var md = require('markdown-it')();
var area = require('../area');
var PvModel = require('../models/ViewerLog');
router.get('/login', function (req, res) {
    res.render('admin/login', {});
});
router.post('/doLogin', function (req, res) {
    var object = req.body;
    var user = {
        username: object.username,
        password: object.password
    };
    User.findOne(user, function (err, obj) {
        if (obj) {
            req.session.user = user;
            if (object.remeber) {
                res.cookie('autologin', 1, {
                    expires: new Date(Date.now() + 864000000)
                });
            }
            res.redirect('/admin/blogList');
        }
        else {
            res.redirect('/admin/login');
        }
    });
});
router.get('/home', function (req, res) {
    var user = req.session.user;
    if (user != null) {
        res.render('admin/home', { title: '后台管理首页', user: user });
    }
    else {
        res.render('admin/login', { title: '用户登录' });
    }
});
router.get('/newArticleUi', function (req, res) {
    Category.find({}, function (err, docs) {
        if (err)
            res.send(err.message);
        res.render('admin/newarticle', { success: 0, categories: docs, token: token });
    });
});
router.post('/newArticle', function (req, res) {
    var content = req.body.content;
    var blog = new Blog({
        title: req.body.title,
        createDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: content,
        status: req.body.status,
        comments: [],
        commentCount: 0,
        category: req.body.category,
        top: 0,
        tags: req.body.tags,
        pv: 0,
        ismd: req.body.ismd
    });
    Category.findOne({ cateName: req.body.category }, function (err, doc) {
        if (doc) {
            blog.save(function (e, docs, numberAffected) {
                if (e)
                    res.send(e.message);
                res.redirect('/admin/blogList?success=1');
            });
        }
        else {
            var category = new Category({
                cateName: req.body.category,
                state: true,
                createDate: moment().format('YYYY-MM-DD HH:mm:ss')
            });
            category.save(function (e, docs, numberAffected) {
                if (e)
                    res.send(e.message);
                console.log("新增分类成功");
            });
            blog.save(function (e, docs, numberAffected) {
                if (e)
                    res.send(e.message);
                res.redirect('/admin/blogList?success=1');
            });
        }
    });
});
router.get('/newArticleMd', function (req, res) {
    var token = qiniu.uptoken('hopefully');
    Category.find({}, function (err, docs) {
        if (err)
            res.send(err.message);
        res.render('admin/newarticlemd', { success: 0, categories: docs, token: token });
    });
});
router.get('/blogList', function (req, res) {
    var user = req.session.user;
    var success = req.query.success || 0;
    var pageIndex = 1;
    var pageSize = 10;
    pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
    pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
    Blog.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
        if (err) {
            res.send(err.message);
            return;
        }
        docs.forEach(function (item, index) {
            if (item.content) {
                if (item.ismd) {
                    item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                }
                else {
                    item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                }
            }
            ;
        });
        res.render('admin/bloglist', { success: success, blogList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length });
    });
});
router.get('/blogDetail/:id', function (req, res) {
    var user = req.session.user;
    Blog.findById(req.params.id, function (err, doc) {
        if (err)
            res.send(err.message);
        if (doc.ismd) {
            doc.content = md.render(doc.content);
        }
        res.render('admin/blogdetail', { blog: doc, user: user });
    });
});
router.get('/deleteBlog/:id', function (req, res) {
    var user = req.session.user;
    Blog.findByIdAndRemove(req.params.id, function (err) {
        res.redirect('/admin/blogList');
    });
});
router.get('/toEditArticle/:id', function (req, res) {
    var token = qiniu.uptoken('hopefully');
    async.series([
        function (callback) {
            Blog.findById(req.params.id, function (err, doc) {
                if (err)
                    res.send(err.message);
                callback(null, doc);
            });
        },
        function (callback) {
            Category.find({}, function (err, docs) {
                if (err)
                    res.send(err.message);
                callback(null, docs);
            });
        }], function (err, result) {
        if (result[0].ismd) {
            res.render('admin/editarticlemd', { success: 0, categories: result[1], blog: result[0], token: token });
        }
        else {
            res.render('admin/editarticle', { success: 0, categories: result[1], blog: result[0], token: token });
        }
    });
});
router.post('/editArticle/:id', function (req, res) {
    var content = req.body.content;
    Blog.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            content: content,
            category: req.body.category,
            tags: req.body.tags,
            status: req.body.status,
            updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
    }, function (err, doc) {
        if (err)
            res.send(err.message);
        res.redirect('/admin/blogDetail/' + req.params.id);
    });
});
router.get('/category', function (req, res) {
    Category.find({}, function (err, docs) {
        if (err)
            res.send(err.message);
        res.render('admin/category', { user: req.session.user, cates: docs });
    });
});
router.post('/addCategory', function (req, res) {
    var category = new Category();
    category.cateName = req.body.cateName;
    category.state = 1;
    category.createDate = moment().format('YYYY-MM-DD HH:mm:ss');
    category.save(function (e, docs, numberAffected) {
        if (e)
            res.send(e.message);
        res.redirect('/admin/category');
    });
});
router.get('/deleteCate/:id', function (req, res) {
    var user = req.session.user;
    Category.findByIdAndRemove(req.params.id, function (err) {
        res.redirect('/admin/category');
    });
});
router.get('/addUser', function (req, res) {
    res.render('admin/adduser', { success: 0, flag: 0, user: req.session.user });
});
router.post('/addUser', function (req, res) {
    var password = req.body.password;
    var user = new User({
        username: req.body.username,
        nickname: req.body.nickname,
        password: password,
        level: 1,
        state: true,
        createDate: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    user.save(function (e, docs, numberAffected) {
        if (e)
            res.send(e.message);
        res.render('admin/adduser', { success: 1, user: req.session.user });
    });
});
router.get('/viewUser', function (req, res) {
    User.find({}, null, function (err, docs) {
        if (err)
            res.send(err.message);
        res.render('admin/viewuser', { users: docs, user: req.session.user });
    });
});
router.get('/toModifyUser/:userId', function (req, res) {
    User.findById(req.params.userId, function (err, doc) {
        if (err)
            res.send(err.message);
        res.render('admin/modifyuser', {
            user: doc,
            success: 0,
            flag: 1
        });
    });
});
router.post('/modifyUser/:userId', function (req, res) {
    User.findByIdAndUpdate(req.params.userId, {
        $set: {
            username: req.body.username,
            nickname: req.body.nickname,
            password: req.body.password,
            updateDate: moment().format('YYYY-MM-DD HH:mm:ss')
        }
    }, function (err, doc) {
        if (err)
            res.send(err.message);
        res.render('admin/modifyuser', { user: doc, success: 1, flag: 1 });
    });
});
router.get('/deleteUser/:userId', function (req, res) {
    User.remove({ _id: req.params.userId }, function (err) {
        res.redirect('/admin/viewUser');
    });
});
router.get('/logout', function (req, res) {
    req.session.user = null;
    res.clearCookie("autologin");
    res.redirect('/admin/login');
});
router.get('/test', function (req, res) {
    res.render('admin/menu', {});
});
router.get('/addWeatherUser', function (req, res) {
    res.render('admin/addweatheruser', { success: 0, flag: 0, user: req.session.user });
});
router.post('/addWeatherUser', function (req, res) {
    var args = req.body;
    var areaId = _.result(_.find(area, { 'NAMECN': args.city }), 'AREAID');
    var weathUser = new WeatherUser({
        username: args.username,
        mobile: args.mobile,
        city: args.city,
        cityCode: areaId,
        sendCount: 0,
        status: 1,
        createAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    });
    weathUser.save(function (e, docs, numberAffected) {
        if (e)
            res.send(e.message);
        res.render('admin/addweatheruser', { success: 1, user: req.session.user });
    });
});
router.get('/weatherUserList', function (req, res) {
    WeatherUser.find({}, null, function (err, docs) {
        if (err)
            res.send(err.message);
        res.render('admin/weatherUser', { wusers: docs, user: req.session.user });
    });
});
router.get('/delWeatherUser/:userId', function (req, res) {
    WeatherUser.remove({ _id: req.params.userId }, function (err) {
        res.redirect('/admin/weatherUserList');
    });
});
router.post('/quicknote', function (req, res) {
    var quicknote = new QuickNote({
        content: req.body.content,
        state: true,
        createDate: moment().format('YYYY-MM-DD HH:mm:ss')
    });
    quicknote.save(function (e, docs, numberAffected) {
        if (e)
            res.send(e.message);
        res.redirect('/admin/quickNoteList');
    });
});
router.get('/quickNoteList', function (req, res) {
    var user = req.session.user;
    var success = req.query.success || 0;
    var pageIndex = 1;
    var pageSize = 10;
    pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
    pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
    QuickNote.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
        if (err) {
            res.send(err.message);
            return;
        }
        docs.forEach(function (item, index) {
            if (item.content) {
                item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
            }
            ;
        });
        res.render('admin/quicknote', { success: success, noteList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length });
    });
});
router.get('/readCount', function (req, res) {
    var today = moment().format('YYYY-MM-DD');
    async.parallel([
        function (callback) {
            Blog.aggregate({ $group: { _id: null, pvCount: { $sum: '$pv' } } }, function (err, doc) {
                callback(err, doc[0].pvCount);
            });
        },
        function (callback) {
            PvModel.count({ createdAt: { $regex: today, $options: 'i' } }, function (err, count) {
                callback(err, count);
            });
        }
    ], function (err, result) {
        res.render('admin/readcount', { readCount: result[0], todayRead: result[1] });
    });
});
module.exports = router;
//# sourceMappingURL=admin.js.map