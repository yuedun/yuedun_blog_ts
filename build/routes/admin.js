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
var crypto = require("crypto");
var Markdown = require("markdown-it");
var Debug = require("debug");
var debug = Debug('yuedun:admin');
var user_model_1 = require("../models/user-model");
var blog_model_1 = require("../models/blog-model");
var quick_note_model_1 = require("../models/quick-note-model");
var category_model_1 = require("../models/category-model");
var weather_user_model_1 = require("../models/weather-user-model");
var about_model_1 = require("../models/about-model");
var viewer_log_model_1 = require("../models/viewer-log-model");
var friend_link_model_1 = require("../models/friend-link-model");
var resume_model_1 = require("../models/resume-model");
var qiniu = require("../utils/qiniu");
var md = Markdown();
var area = require('../area');
var route_1 = require("../utils/route");
function generatorPassword(password) {
    var hash = crypto.createHash('sha1');
    hash.update(password);
    return hash.digest("hex");
}
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req, res) {
        var user = req.session && req.session.user ? req.session.user : null;
        if (user != null) {
            var todayStart = Moment().hours(0).minutes(0).seconds(0).toDate();
            var todayEnd = Moment().toDate();
            return Promise.all([
                blog_model_1.default.aggregate([{ $group: { _id: null, pvCount: { $sum: '$pv' } } }]),
                viewer_log_model_1.default.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }).exec(),
                viewer_log_model_1.default.aggregate([
                    { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
                    { $group: { _id: { blogId: '$blogId', title: "$title", url: "$url" }, pv: { $sum: 1 } } },
                    { $sort: { createAt: -1 } }
                ]),
                viewer_log_model_1.default.find({}, null, { sort: { _id: -1 }, limit: 20 })
            ]).then(function (_a) {
                var result1 = _a[0], result2 = _a[1], result3 = _a[2], result4 = _a[3];
                return { readCount: result1[0].pvCount, todayRead: result2, recent: result3, newRead: result4 };
            });
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
            password: generatorPassword(object.password)
        };
        return user_model_1.default.findOne(user)
            .then(function (obj) {
            if (obj || process.env.NODE_ENV === 'development') {
                req.session.user = user;
                return new route_1.RedirecPage('/admin/blogList');
            }
            else {
                return new route_1.RedirecPage('/admin/login');
            }
        });
    };
    Routes.newArticle = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        return category_model_1.default.find({})
            .then(function (catotory) {
            return { success: 0, categories: catotory, token: token };
        });
    };
    Routes.newArticleMd = function (req, res) {
        var token = qiniu.uptoken('hopefully');
        return category_model_1.default.find({})
            .then(function (catogory) {
            return { success: 0, categories: catogory, token: token };
        });
    };
    Routes.createArticle = function (req, res) {
        var args = req.body;
        var blog = new blog_model_1.default({
            title: args.title,
            content: args.content,
            status: parseInt(args.status),
            comments: [],
            commentCount: 0,
            category: args.category,
            top: 0,
            tags: args.tags,
            pv: 0,
            ismd: args.ismd
        });
        return category_model_1.default.findOne({ cateName: args.category })
            .then(function (category) {
            if (!category) {
                var category = new category_model_1.default({
                    cateName: args.category,
                    state: true
                });
                return category.save();
            }
            else {
                return category;
            }
        }).then(function (category) {
            return blog.save();
        }).then(function () {
            return { success: 1 };
        }).catch(function (err) {
            return { success: 0, msg: err };
        });
    };
    Routes.blogList = function (req, res) {
        var user = req.session ? req.session.user : null;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        var conditions = {};
        if (req.query.title) {
            conditions.title = { $regex: req.query.title, $options: 'i' };
        }
        return blog_model_1.default.find(conditions, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
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
            return {
                success: success,
                title: req.query.title,
                blogList: docs,
                user: user,
                pageIndex: pageIndex,
                pageCount: docs.length
            };
        });
    };
    Routes.blogDetail = function (req, res) {
        var user = req.session.user;
        return blog_model_1.default.findById(req.params.id)
            .then(function (doc) {
            if (doc.ismd) {
                doc.content = md.render(doc.content);
            }
            return { blog: doc, user: user };
        });
    };
    Routes.editArticleMd = function (req, res) {
        var getBlogById = blog_model_1.default.findById(req.params.id).exec();
        var getCategory = category_model_1.default.find({}).exec();
        return Promise.all([getBlogById, getCategory])
            .then(function (_a) {
            var blogObj = _a[0], categories = _a[1];
            return { blog: blogObj, categories: categories };
        });
    };
    Routes.updateArticle = function (req, res) {
        var args = req.body;
        var md = args.ismd ? 1 : 0;
        return blog_model_1.default.findByIdAndUpdate(req.params.id, {
            $set: {
                title: args.title,
                content: args.content,
                category: args.category,
                tags: args.tags,
                status: parseInt(args.status),
                ismd: md
            }
        }).then(function () {
            return { success: 1 };
        });
    };
    Routes.deleteBlog = function (req, res) {
        var user = req.session.user;
        return blog_model_1.default.findByIdAndRemove(req.params.id)
            .then(function (doc) {
            return new route_1.RedirecPage('/admin/blogList');
        });
    };
    Routes.category = function (req, res) {
        return category_model_1.default.find({})
            .then(function (docs) {
            return { cates: docs };
        });
    };
    Routes.addCategory = function (req, res) {
        var category = new category_model_1.default({
            cateName: req.body.cateName,
            state: true
        });
        return Promise.resolve(category.save());
    };
    Routes.deleteCate = function (req, res) {
        var user = req.session.user;
        category_model_1.default.findByIdAndRemove(req.params.id, function (err) {
            return new route_1.RedirecPage('/admin/category');
        });
    };
    Routes.addUserUi = function (req, res) {
        return Promise.resolve({ success: 0, flag: 0 });
    };
    Routes.addUser = function (req, res) {
        var password = req.body.password;
        var user = new user_model_1.default({
            username: req.body.username,
            nickname: req.body.nickname,
            password: generatorPassword(password),
            level: 1,
            state: true,
            createdAt: new Date()
        });
        return user.save()
            .then(function () {
            return { success: 1 };
        });
    };
    Routes.viewUser = function (req, res) {
        return user_model_1.default.find({}).exec().then(function (docs) {
            return Promise.resolve({ users: docs, title: req.query.title });
        });
    };
    Routes.toModifyUser = function (req, res) {
        user_model_1.default.findById(req.params.userId, function (err, doc) {
            if (err)
                res.send(err.message);
            res.render('admin/modifyUser', {
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
        user_model_1.default.remove({ _id: req.params.userId }).then(function () {
            return new route_1.RedirecPage('/admin/viewUser');
        });
    };
    Routes.logout = function (req, res) {
        return new Promise(function (resolve, reject) {
            req.session.destroy(function (err) {
                resolve(new route_1.RedirecPage('/admin/login'));
            });
        });
    };
    Routes.addWeatherUser = function (req, res) {
        return Promise.resolve({ success: 0, flag: 0 });
    };
    Routes.createWeatherUser = function (req, res) {
        var args = req.body;
        var areaId = _.result(_.find(area, { 'NAMECN': args.city }), 'AREAID');
        var weathUser = new weather_user_model_1.default({
            username: args.username,
            mobile: args.mobile,
            city: args.city,
            cityCode: areaId,
            sendCount: 0,
            status: 1,
            createAt: new Date()
        });
        return weathUser.save()
            .then(function (data) {
            return new route_1.RedirecPage('/admin/weatherUserList');
        });
    };
    Routes.weatherUserList = function (req, res) {
        return weather_user_model_1.default.find({}, null)
            .then(function (docs) {
            return { wusers: docs };
        });
    };
    Routes.delWeatherUser = function (req, res) {
        return Promise.resolve(weather_user_model_1.default.remove({ _id: req.params.userId }).exec())
            .then(function (d) {
            return new route_1.RedirecPage('/admin/weatherUserList');
        });
    };
    Routes.quicknote = function (req, res) {
        var quicknote = new quick_note_model_1.default({
            content: req.body.content,
            status: true,
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
        });
        return quicknote.save()
            .then(function (data) {
            return new route_1.RedirecPage('/admin/quickNoteList');
        });
    };
    Routes.editQuickNote = function (req, res) {
        return quick_note_model_1.default.findById(req.params.id).then(function (note) {
            return { note: note, success: 1 };
        });
    };
    Routes.updateQuickNote = function (req, res) {
        return quick_note_model_1.default.findByIdAndUpdate(req.params.id, {
            $set: {
                content: req.body.content,
                updateDate: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }).then(function () {
            return new route_1.RedirecPage('/admin/quickNoteList');
        });
    };
    Routes.deleteNote = function (req, res) {
        return quick_note_model_1.default.remove({ _id: req.params.id }).exec()
            .then(function () {
            return new route_1.RedirecPage('/admin/quickNoteList');
        });
    };
    Routes.quickNoteList = function (req, res) {
        var user = req.session.user;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        return quick_note_model_1.default.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
            .then(function (docs) {
            docs.forEach(function (item, index) {
                if (item.content) {
                    item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                }
                ;
            });
            return { noteList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length };
        });
    };
    Routes.aboutConfig = function (req, res) {
        var arr = [];
        return Promise.resolve(about_model_1.default.findOne().exec())
            .then(function (resume) {
            if (!resume) {
                var r = new about_model_1.default({
                    nickname: "待修改",
                    job: "待修改",
                    addr: "待修改",
                    tel: "待修改",
                    email: "待修改",
                    resume: "待修改",
                    other: "待修改"
                });
                return r.save();
            }
            else {
                return resume;
            }
        }).then(function (resume) {
            return { resume: resume.toObject() };
        });
    };
    Routes.updateAboutConfig = function (req, res) {
        var args = req.body;
        debug(args);
        return about_model_1.default.findOneAndUpdate(null, args)
            .then(function () {
            return { success: 1 };
        });
    };
    ;
    Routes.resume = function (req, res) {
        return resume_model_1.default.findOne()
            .then(function (resume) {
            if (resume) {
                return resume;
            }
            else {
                return resume_model_1.default.create({
                    state: 0
                });
            }
        }).then(function (resume) {
            return { resume: resume };
        });
    };
    ;
    Routes.resumeSwitch = function (req, res) {
        var state = req.body.state;
        var id = req.body.id;
        return resume_model_1.default.findByIdAndUpdate(id, {
            $set: { state: state }
        }).exec();
    };
    ;
    Routes.updateResume = function (req, res) {
        var _a = req.body, id = _a.id, content = _a.content;
        return resume_model_1.default.findById(id).then(function (record) {
            record.bakup = record.content;
            record.content = content;
            return record.save();
        });
    };
    ;
    Routes.friendLinkList = function (req, res) {
        return friend_link_model_1.default.find().exec()
            .then(function (data) {
            console.log(data);
            return { success: 0, friendLinks: data };
        });
    };
    Routes.addFriendLink = function (req, res) {
        return friend_link_model_1.default.create({
            url: req.body.url,
            name: req.body.name
        }).then(function (data) {
            return new route_1.RedirecPage('/admin/friendLinkList');
        });
    };
    Routes.freezeFriendLink = function (req, res) {
        var state = req.query.state;
        return friend_link_model_1.default.update({
            _id: req.params.id
        }, {
            state: state
        }).then(function (data) {
            return new route_1.RedirecPage('/admin/friendLinkList');
        });
    };
    Routes.delFriendLink = function (req, res) {
        return friend_link_model_1.default.remove({
            _id: req.params.id
        }).then(function (data) {
            return new route_1.RedirecPage('/admin/friendLinkList');
        });
    };
    Routes.updateTime = function (req, res) {
        return blog_model_1.default.find().then(function (blogs) {
            return Promise.each(blogs, function (item, index) {
                var time = new Date(item.createdAt);
                item.set("createdAt", time);
                console.log(">>>>>>>>>", time);
                item.set("updatedAt", time);
                return item.save();
            });
        });
    };
    ;
    __decorate([
        route_1.route({})
    ], Routes, "index", null);
    __decorate([
        route_1.route({})
    ], Routes, "login", null);
    __decorate([
        route_1.route({
            method: "post"
        })
    ], Routes, "doLogin", null);
    __decorate([
        route_1.route({})
    ], Routes, "newArticle", null);
    __decorate([
        route_1.route({})
    ], Routes, "newArticleMd", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "createArticle", null);
    __decorate([
        route_1.route({})
    ], Routes, "blogList", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "blogDetail", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "editArticleMd", null);
    __decorate([
        route_1.route({
            path: ":id",
            method: "post",
            json: true
        })
    ], Routes, "updateArticle", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "deleteBlog", null);
    __decorate([
        route_1.route({})
    ], Routes, "category", null);
    __decorate([
        route_1.route({
            method: "post"
        })
    ], Routes, "addCategory", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "deleteCate", null);
    __decorate([
        route_1.route({})
    ], Routes, "addUserUi", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "addUser", null);
    __decorate([
        route_1.route({})
    ], Routes, "viewUser", null);
    __decorate([
        route_1.route({
            path: ":userId"
        })
    ], Routes, "toModifyUser", null);
    __decorate([
        route_1.route({
            path: ":userId",
            method: "post"
        })
    ], Routes, "modifyUser", null);
    __decorate([
        route_1.route({
            path: ":userId"
        })
    ], Routes, "deleteUser", null);
    __decorate([
        route_1.route({})
    ], Routes, "logout", null);
    __decorate([
        route_1.route({})
    ], Routes, "addWeatherUser", null);
    __decorate([
        route_1.route({
            method: "post"
        })
    ], Routes, "createWeatherUser", null);
    __decorate([
        route_1.route({})
    ], Routes, "weatherUserList", null);
    __decorate([
        route_1.route({
            path: ":userId"
        })
    ], Routes, "delWeatherUser", null);
    __decorate([
        route_1.route({
            method: "post"
        })
    ], Routes, "quicknote", null);
    __decorate([
        route_1.route({
            method: "get",
            path: ":id"
        })
    ], Routes, "editQuickNote", null);
    __decorate([
        route_1.route({
            method: "post",
            path: ":id"
        })
    ], Routes, "updateQuickNote", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "deleteNote", null);
    __decorate([
        route_1.route({})
    ], Routes, "quickNoteList", null);
    __decorate([
        route_1.route({})
    ], Routes, "aboutConfig", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "updateAboutConfig", null);
    __decorate([
        route_1.route({})
    ], Routes, "resume", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "resumeSwitch", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "updateResume", null);
    __decorate([
        route_1.route({})
    ], Routes, "friendLinkList", null);
    __decorate([
        route_1.route({
            method: "post",
            json: true
        })
    ], Routes, "addFriendLink", null);
    __decorate([
        route_1.route({
            method: "get",
            path: ":id"
        })
    ], Routes, "freezeFriendLink", null);
    __decorate([
        route_1.route({
            method: "get",
            path: ":id"
        })
    ], Routes, "delFriendLink", null);
    __decorate([
        route_1.route({ json: true })
    ], Routes, "updateTime", null);
    return Routes;
}());
exports.default = Routes;
//# sourceMappingURL=admin.js.map