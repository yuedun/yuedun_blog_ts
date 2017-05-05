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
var Promise = require("bluebird");
var user_model_1 = require("../models/user-model");
var blog_model_1 = require("../models/blog-model");
var quick_note_model_1 = require("../models/quick-note-model");
var category_model_1 = require("../models/category-model");
var weather_user_model_1 = require("../models/weather-user-model");
var qiniu = require("../utils/qiniu");
var Markdown = require("markdown-it");
var md = Markdown();
var area = require('../area');
var viewer_log_model_1 = require("../models/viewer-log-model");
var route_1 = require("../utils/route");
var Routes = (function () {
    function Routes() {
    }
    Routes.home = function (req, res) {
        var user = req.session ? req.session.user : {};
        if (user != null) {
            return Promise.resolve({ title: '后台管理首页', user: user });
        }
        else {
            return Promise.resolve({ title: '用户登录' });
        }
    };
    Routes.login = function (req, res) {
        return Promise.resolve({});
    };
    Routes.doLogin = function (req, res) {
        var object = req.body;
        var user = {
            username: object.username,
            password: object.password
        };
        return user_model_1.default.findOne(user)
            .then(function (obj) {
            if (obj || process.env.NODE_ENV === 'development') {
                req.session.user = user;
                if (object.remeber) {
                    res.cookie('autologin', 1, {
                        expires: new Date(Date.now() + 864000000)
                    });
                }
                res.redirect('/admin/blogList');
                return;
            }
            else {
                res.redirect('/admin/login');
                return;
            }
        });
    };
    Routes.newArticleUi = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        return category_model_1.default.find({})
            .then(function (catotory) {
            return Promise.resolve({ success: 0, categories: catotory, token: token });
        });
    };
    Routes.newArticle = function (req, res) {
        var content = req.body.content;
        var blog = new blog_model_1.default({
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
        return category_model_1.default.findOne({ cateName: req.body.category })
            .then(function (category) {
            if (!category) {
                var category = new category_model_1.default({
                    cateName: req.body.category,
                    state: true,
                    createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
                });
                return category.save();
            }
            else {
                return category;
            }
        }).then(function (category) {
            return blog.save();
        }).then(function () {
            console.log(">>>>>>>>>>>>");
            res.redirect('/admin/blogList?success=1');
        });
    };
    Routes.newArticleMd = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        return category_model_1.default.find({})
            .then(function (catogory) {
            return Promise.resolve({ success: 0, categories: catogory, token: token });
        });
    };
    Routes.blogList = function (req, res) {
        var user = req.session ? req.session.user : null;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        return blog_model_1.default.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
            .then(function (docs) {
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
        return blog_model_1.default.findById(req.params.id)
            .then(function (doc) {
            if (doc.ismd) {
                doc.content = md.render(doc.content);
            }
            return Promise.resolve({ blog: doc, user: user });
        });
    };
    Routes.deleteBlog = function (req, res) {
        var user = req.session.user;
        return blog_model_1.default.findByIdAndRemove(req.params.id)
            .then(function (doc) {
            res.redirect('/admin/blogList');
        });
    };
    Routes.toEditArticle = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        var getBlogById = new Promise(function (resolve, reject) {
            blog_model_1.default.findById(req.params.id, function (err, doc) {
                if (err)
                    reject(err);
                resolve(doc);
            });
        });
        var getCategory = new Promise(function (resolve, reject) {
            category_model_1.default.find({}, function (err, docs) {
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
        blog_model_1.default.findByIdAndUpdate(req.params.id, {
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
        category_model_1.default.find({}, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/category', { user: req.session.user, cates: docs });
        });
    };
    Routes.addCategory = function (req, res) {
        var category = new category_model_1.default();
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
        category_model_1.default.findByIdAndRemove(req.params.id, function (err) {
            res.redirect('/admin/category');
        });
    };
    Routes.addUserUi = function (req, res) {
        res.render('admin/adduser', { success: 0, flag: 0, user: req.session.user });
    };
    Routes.addUser = function (req, res) {
        var password = req.body.password;
        var user = new user_model_1.default({
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
        user_model_1.default.find({}, null, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/viewuser', { users: docs, user: req.session.user });
        });
    };
    Routes.toModifyUser = function (req, res) {
        user_model_1.default.findById(req.params.userId, function (err, doc) {
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
        user_model_1.default.findByIdAndUpdate(req.params.userId, {
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
        user_model_1.default.remove({ _id: req.params.userId }, function (err) {
            res.redirect('/admin/viewUser');
        });
    };
    Routes.logout = function (req, res) {
        req.session.user = null;
        res.clearCookie("autologin");
        res.redirect('/admin/login');
        return;
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
        var weathUser = new weather_user_model_1.default({
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
        weather_user_model_1.default.find({}, null, function (err, docs) {
            if (err)
                res.send(err.message);
            res.render('admin/weatherUser', { wusers: docs, user: req.session.user });
        });
    };
    Routes.delWeatherUser = function (req, res) {
        weather_user_model_1.default.remove({ _id: req.params.userId }, function (err) {
            res.redirect('/admin/weatherUserList');
        });
    };
    Routes.quicknote = function (req, res) {
        var quicknote = new quick_note_model_1.default({
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
        quick_note_model_1.default.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
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
        return Promise.all([
            blog_model_1.default.aggregate({ $group: { _id: null, pvCount: { $sum: '$pv' } } }),
            viewer_log_model_1.default.count({ createdAt: { $regex: today, $options: 'i' } })
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1];
            return { readCount: result1[0].pvCount, todayRead: result2 };
        });
    };
    return Routes;
}());
__decorate([
    route_1.route({
        path: "/",
        method: "get"
    })
], Routes, "home", null);
__decorate([
    route_1.route({
        path: "/login",
        method: "get"
    })
], Routes, "login", null);
__decorate([
    route_1.route({
        path: "/doLogin",
        method: "post"
    })
], Routes, "doLogin", null);
__decorate([
    route_1.route({
        path: "/newArticleUi",
        method: "get"
    })
], Routes, "newArticleUi", null);
__decorate([
    route_1.route({
        path: "/newArticle",
        method: "post"
    })
], Routes, "newArticle", null);
__decorate([
    route_1.route({
        path: "/newArticleMd",
        method: "get"
    })
], Routes, "newArticleMd", null);
__decorate([
    route_1.route({
        path: "/blogList",
        method: "get"
    })
], Routes, "blogList", null);
__decorate([
    route_1.route({
        path: "/blogDetail/:id",
        method: "get"
    })
], Routes, "blogDetail", null);
__decorate([
    route_1.route({
        path: "/deleteBlog/:id",
        method: "get"
    })
], Routes, "deleteBlog", null);
__decorate([
    route_1.route({
        path: "/toEditArticle/:id",
        method: "get"
    })
], Routes, "toEditArticle", null);
__decorate([
    route_1.route({
        path: "/editArticle/:id",
        method: "get"
    })
], Routes, "editArticle", null);
__decorate([
    route_1.route({
        path: "/category",
        method: "get"
    })
], Routes, "category", null);
__decorate([
    route_1.route({
        path: "/addCategory",
        method: "post"
    })
], Routes, "addCategory", null);
__decorate([
    route_1.route({
        path: "/deleteCate/:id",
        method: "get"
    })
], Routes, "deleteCate", null);
__decorate([
    route_1.route({
        path: "/addUserUi",
        method: "get"
    })
], Routes, "addUserUi", null);
__decorate([
    route_1.route({
        path: "/addUser",
        method: "post"
    })
], Routes, "addUser", null);
__decorate([
    route_1.route({
        path: "/viewUser",
        method: "get"
    })
], Routes, "viewUser", null);
__decorate([
    route_1.route({
        path: "/toModifyUser/:userId",
        method: "get"
    })
], Routes, "toModifyUser", null);
__decorate([
    route_1.route({
        path: "/modifyUser/:userId",
        method: "post"
    })
], Routes, "modifyUser", null);
__decorate([
    route_1.route({
        path: "/deleteUser/:userI",
        method: "get"
    })
], Routes, "deleteUser", null);
__decorate([
    route_1.route({
        path: "/logout",
        method: "get"
    })
], Routes, "logout", null);
__decorate([
    route_1.route({
        path: "/test",
        method: "get"
    })
], Routes, "test", null);
__decorate([
    route_1.route({
        path: "/addWeatherUser",
        method: "get"
    })
], Routes, "addWeatherUserUi", null);
__decorate([
    route_1.route({
        path: "/addWeatherUser",
        method: "post"
    })
], Routes, "addWeatherUser", null);
__decorate([
    route_1.route({
        path: "/weatherUserList",
        method: "get"
    })
], Routes, "weatherUserList", null);
__decorate([
    route_1.route({
        path: "/delWeatherUser/:userId",
        method: "get"
    })
], Routes, "delWeatherUser", null);
__decorate([
    route_1.route({
        path: "/quicknote",
        method: "get"
    })
], Routes, "quicknote", null);
__decorate([
    route_1.route({
        path: "/quickNoteList",
        method: "get"
    })
], Routes, "quickNoteList", null);
__decorate([
    route_1.route({
        path: "/readCount",
        method: "get"
    })
], Routes, "readCount", null);
exports.default = Routes;
//# sourceMappingURL=admin.js.map