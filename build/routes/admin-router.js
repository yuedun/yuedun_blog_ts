"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Moment = require("moment");
var Async = require("async");
var Promise = require("bluebird");
var User_1 = require("../models/User");
var Blog_1 = require("../models/Blog");
var QuickNote_1 = require("../models/QuickNote");
var Category_1 = require("../models/Category");
var WeatherUser_1 = require("../models/WeatherUser");
var qiniu = require("../utils/qiniu");
var Markdown = require("markdown-it");
var md = Markdown();
var area = require('../area');
var ViewerLog_1 = require("../models/ViewerLog");
var route_1 = require("../utils/route");
var Routes = (function () {
    function Routes() {
    }
    Routes.login = function (req, res) {
        res.render('admin/login', {});
    };
    Routes.doLogin = function (req, res) {
        var object = req.body;
        var user = {
            username: object.username,
            password: object.password
        };
        User_1.default.findOne(user, function (err, obj) {
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
    };
    Routes.home = function (req, res) {
        var user = req.session.user;
        if (user != null) {
            res.render('admin/home', { title: '后台管理首页', user: user });
        }
        else {
            res.render('admin/login', { title: '用户登录' });
        }
    };
    Routes.newArticleUi = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        Category_1.default.find({}, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/newarticle', { success: 0, categories: docs, token: token });
        });
    };
    Routes.newArticle = function (req, res) {
        var content = req.body.content;
        var blog = new Blog_1.default({
            title: req.body.title,
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss'),
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
        Category_1.default.findOne({ cateName: req.body.category }, function (err, doc) {
            if (doc) {
                blog.save(function (e, docs, numberAffected) {
                    if (e)
                        res.send(e.message);
                    res.redirect('/admin/blogList?success=1');
                });
            }
            else {
                var category = new Category_1.default({
                    cateName: req.body.category,
                    state: true,
                    createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
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
    };
    Routes.newArticleMd = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        Category_1.default.find({}, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/newarticlemd', { success: 0, categories: docs, token: token });
        });
    };
    Routes.blogList = function (req, res) {
        var user = req.session.user;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        Blog_1.default.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
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
    };
    Routes.blogDetail = function (req, res) {
        var user = req.session.user;
        Blog_1.default.findById(req.params.id, function (err, doc) {
            if (err)
                res.send(err.message);
            if (doc.ismd) {
                doc.content = md.render(doc.content);
            }
            res.render('admin/blogdetail', { blog: doc, user: user });
        });
    };
    Routes.deleteBlog = function (req, res) {
        var user = req.session.user;
        Blog_1.default.findByIdAndRemove(req.params.id, function (err) {
            res.redirect('/admin/blogList');
        });
    };
    Routes.toEditArticle = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        var getBlogById = new Promise(function (resolve, reject) {
            Blog_1.default.findById(req.params.id, function (err, doc) {
                if (err)
                    reject(err);
                resolve(doc);
            });
        });
        var getCategory = new Promise(function (resolve, reject) {
            Category_1.default.find({}, function (err, docs) {
                if (err)
                    reject(err);
                resolve(docs);
            });
        });
        Promise.all([getBlogById, getCategory])
            .then(function (_a) {
            var blogObj = _a[0], categories = _a[1];
            if (blogObj.ismd) {
                res.render('admin/editarticlemd', { success: 0, blog: blogObj, categories: categories, token: token });
            }
            else {
                res.render('admin/editarticle', { success: 0, blog: blogObj, categories: categories, token: token });
            }
        });
    };
    Routes.editArticle = function (req, res) {
        var content = req.body.content;
        Blog_1.default.findByIdAndUpdate(req.params.id, {
            $set: {
                title: req.body.title,
                content: content,
                category: req.body.category,
                tags: req.body.tags,
                status: req.body.status,
                updateTime: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }, function (err, doc) {
            if (err)
                res.send(err.message);
            res.redirect('/admin/blogDetail/' + req.params.id);
        });
    };
    Routes.category = function (req, res) {
        Category_1.default.find({}, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/category', { user: req.session.user, cates: docs });
        });
    };
    Routes.addCategory = function (req, res) {
        var category = new Category_1.default();
        category.cateName = req.body.cateName;
        category.state = true;
        category.createDate = Moment().format('YYYY-MM-DD HH:mm:ss');
        category.save(function (e, docs, numberAffected) {
            if (e)
                res.send(e.message);
            res.redirect('/admin/category');
        });
    };
    Routes.deleteCate = function (req, res) {
        var user = req.session.user;
        Category_1.default.findByIdAndRemove(req.params.id, function (err) {
            res.redirect('/admin/category');
        });
    };
    Routes.addUserUi = function (req, res) {
        res.render('admin/adduser', { success: 0, flag: 0, user: req.session.user });
    };
    Routes.addUser = function (req, res) {
        var password = req.body.password;
        var user = new User_1.default({
            username: req.body.username,
            nickname: req.body.nickname,
            password: password,
            level: 1,
            state: true,
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
        });
        user.save(function (e, docs, numberAffected) {
            if (e)
                res.send(e.message);
            res.render('admin/adduser', { success: 1, user: req.session.user });
        });
    };
    Routes.viewUser = function (req, res) {
        User_1.default.find({}, null, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/viewuser', { users: docs, user: req.session.user });
        });
    };
    Routes.toModifyUser = function (req, res) {
        User_1.default.findById(req.params.userId, function (err, doc) {
            if (err)
                res.send(err.message);
            res.render('admin/modifyuser', {
                user: doc,
                success: 0,
                flag: 1
            });
        });
    };
    Routes.modifyUser = function (req, res) {
        User_1.default.findByIdAndUpdate(req.params.userId, {
            $set: {
                username: req.body.username,
                nickname: req.body.nickname,
                password: req.body.password,
                updateDate: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }, function (err, doc) {
            if (err)
                res.send(err.message);
            res.render('admin/modifyuser', { user: doc, success: 1, flag: 1 });
        });
    };
    Routes.deleteUser = function (req, res) {
        User_1.default.remove({ _id: req.params.userId }, function (err) {
            res.redirect('/admin/viewUser');
        });
    };
    Routes.logout = function (req, res) {
        req.session.user = null;
        res.clearCookie("autologin");
        res.redirect('/admin/login');
    };
    Routes.test = function (req, res) {
        res.render('admin/menu', {});
    };
    Routes.addWeatherUserUi = function (req, res) {
        res.render('admin/addweatheruser', { success: 0, flag: 0, user: req.session.user });
    };
    Routes.addWeatherUser = function (req, res) {
        var args = req.body;
        var areaId = _.result(_.find(area, { 'NAMECN': args.city }), 'AREAID');
        var weathUser = new WeatherUser_1.default({
            username: args.username,
            mobile: args.mobile,
            city: args.city,
            cityCode: areaId,
            sendCount: 0,
            status: 1,
            createAt: Moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        weathUser.save(function (e, docs, numberAffected) {
            if (e)
                res.send(e.message);
            res.render('admin/addweatheruser', { success: 1, user: req.session.user });
        });
    };
    Routes.weatherUserList = function (req, res) {
        WeatherUser_1.default.find({}, null, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/weatherUser', { wusers: docs, user: req.session.user });
        });
    };
    Routes.delWeatherUser = function (req, res) {
        WeatherUser_1.default.remove({ _id: req.params.userId }, function (err) {
            res.redirect('/admin/weatherUserList');
        });
    };
    Routes.quicknote = function (req, res) {
        var quicknote = new QuickNote_1.default({
            content: req.body.content,
            state: true,
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
        });
        quicknote.save(function (e, docs, numberAffected) {
            if (e)
                res.send(e.message);
            res.redirect('/admin/quickNoteList');
        });
    };
    Routes.quickNoteList = function (req, res) {
        var user = req.session.user;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        QuickNote_1.default.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
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
    };
    Routes.readCount = function (req, res) {
        var today = Moment().format('YYYY-MM-DD');
        Async.parallel([
            function (callback) {
                Blog_1.default.aggregate({ $group: { _id: null, pvCount: { $sum: '$pv' } } }, function (err, doc) {
                    callback(err, doc[0].pvCount);
                });
            },
            function (callback) {
                ViewerLog_1.default.count({ createdAt: { $regex: today, $options: 'i' } }, function (err, count) {
                    callback(err, count);
                });
            }
        ], function (err, result) {
            res.render('admin/readcount', { readCount: result[0], todayRead: result[1] });
        });
    };
    return Routes;
}());
__decorate([
    route_1.adminRoute({
        path: "/login",
        method: "get"
    })
], Routes, "login", null);
__decorate([
    route_1.adminRoute({
        path: "/doLogin",
        method: "post"
    })
], Routes, "doLogin", null);
__decorate([
    route_1.adminRoute({
        path: "/home",
        method: "get"
    })
], Routes, "home", null);
__decorate([
    route_1.adminRoute({
        path: "/newArticleUi",
        method: "get"
    })
], Routes, "newArticleUi", null);
__decorate([
    route_1.adminRoute({
        path: "/newArticle",
        method: "post"
    })
], Routes, "newArticle", null);
__decorate([
    route_1.adminRoute({
        path: "/newArticleMd",
        method: "get"
    })
], Routes, "newArticleMd", null);
__decorate([
    route_1.adminRoute({
        path: "/blogList",
        method: "get"
    })
], Routes, "blogList", null);
__decorate([
    route_1.adminRoute({
        path: "/blogDetail/:id",
        method: "get"
    })
], Routes, "blogDetail", null);
__decorate([
    route_1.adminRoute({
        path: "/deleteBlog/:id",
        method: "delete"
    })
], Routes, "deleteBlog", null);
__decorate([
    route_1.adminRoute({
        path: "/toEditArticle/:id",
        method: "get"
    })
], Routes, "toEditArticle", null);
__decorate([
    route_1.adminRoute({
        path: "/editArticle/:id",
        method: "get"
    })
], Routes, "editArticle", null);
__decorate([
    route_1.adminRoute({
        path: "/category",
        method: "get"
    })
], Routes, "category", null);
__decorate([
    route_1.adminRoute({
        path: "/addCategory",
        method: "post"
    })
], Routes, "addCategory", null);
__decorate([
    route_1.adminRoute({
        path: "/deleteCate/:id",
        method: "get"
    })
], Routes, "deleteCate", null);
__decorate([
    route_1.adminRoute({
        path: "/addUserUi",
        method: "get"
    })
], Routes, "addUserUi", null);
__decorate([
    route_1.adminRoute({
        path: "/addUser",
        method: "post"
    })
], Routes, "addUser", null);
__decorate([
    route_1.adminRoute({
        path: "/viewUser",
        method: "get"
    })
], Routes, "viewUser", null);
__decorate([
    route_1.adminRoute({
        path: "/toModifyUser/:userId",
        method: "get"
    })
], Routes, "toModifyUser", null);
__decorate([
    route_1.adminRoute({
        path: "/modifyUser/:userId",
        method: "post"
    })
], Routes, "modifyUser", null);
__decorate([
    route_1.adminRoute({
        path: "/deleteUser/:userI",
        method: "get"
    })
], Routes, "deleteUser", null);
__decorate([
    route_1.adminRoute({
        path: "/logout",
        method: "get"
    })
], Routes, "logout", null);
__decorate([
    route_1.adminRoute({
        path: "/test",
        method: "get"
    })
], Routes, "test", null);
__decorate([
    route_1.adminRoute({
        path: "/addWeatherUser",
        method: "get"
    })
], Routes, "addWeatherUserUi", null);
__decorate([
    route_1.adminRoute({
        path: "/addWeatherUser",
        method: "post"
    })
], Routes, "addWeatherUser", null);
__decorate([
    route_1.adminRoute({
        path: "/weatherUserList",
        method: "get"
    })
], Routes, "weatherUserList", null);
__decorate([
    route_1.adminRoute({
        path: "/delWeatherUser/:userId",
        method: "get"
    })
], Routes, "delWeatherUser", null);
__decorate([
    route_1.adminRoute({
        path: "/quicknote",
        method: "get"
    })
], Routes, "quicknote", null);
__decorate([
    route_1.adminRoute({
        path: "/quickNoteList",
        method: "get"
    })
], Routes, "quickNoteList", null);
__decorate([
    route_1.adminRoute({
        path: "/readCount",
        method: "get"
    })
], Routes, "readCount", null);
exports.Routes = Routes;
//# sourceMappingURL=admin-router.js.map