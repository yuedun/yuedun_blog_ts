"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("bluebird");
var moment = require("moment");
var blog_model_1 = require("../models/blog-model");
var about_model_1 = require("../models/about-model");
var quick_note_model_1 = require("../models/quick-note-model");
var viewer_log_model_1 = require("../models/viewer-log-model");
var friend_link_model_1 = require("../models/friend-link-model");
var resume_model_1 = require("../models/resume-model");
var category_model_1 = require("../models/category-model");
var Markdown = require("markdown-it");
var message_1 = require("../utils/message");
var Debug = require("debug");
var debug = Debug('yuedun:article');
var md = Markdown({
    highlight: function (str, lang) {
        if (lang) {
            return "<pre class=\"prettyprint " + lang + "\"><code>" + str + "</code></pre>";
        }
        return "<pre class=\"prettyprint\"><code>" + md.utils.escapeHtml(str) + "</code></pre>";
    }
});
var route_1 = require("../utils/route");
var settings = require("../settings");
var Routes = (function () {
    function Routes() {
    }
    Routes.index = function (req, res) {
        var pageIndex = 0;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : pageIndex;
        pageSize = req.query.pageSize ? Number(req.query.pageSize) : pageSize;
        var category = req.query.category;
        var condition = {
            status: 1
        };
        if (category) {
            condition.category = category;
        }
        var blogPromise = Promise.resolve(blog_model_1.default.find(condition, null, { sort: { _id: -1 }, skip: pageIndex * pageSize, limit: pageSize }));
        return getNewTopFriend().then(function (list) {
            return Promise.all([blogPromise, blog_model_1.default.count(condition)])
                .then(function (_a) {
                var blogList = _a[0], totalIndex = _a[1];
                blogList.forEach(function (item, index) {
                    if (item.ismd) {
                        item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                    }
                    else {
                        item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                    }
                });
                return {
                    blogList: blogList,
                    totalIndex: totalIndex,
                    newList: list.newList,
                    topList: list.topList,
                    pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                    pageSize: pageSize,
                    pageCount: blogList.length,
                    category: category,
                    friendLinks: list.friendLink,
                    categories: list.category
                };
            });
        });
    };
    ;
    Routes.blogdetail = function (req, res) {
        var blogId = req.params.id;
        var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var visited = ip + blogId;
        var blogPromise;
        if (req.cookies['visited' + blogId]) {
            blogPromise = blog_model_1.default.findById(req.params.id);
        }
        else {
            blogPromise = blog_model_1.default.findByIdAndUpdate(req.params.id, { $inc: { pv: 1 } });
        }
        return getNewTopFriend().then(function (list) {
            return Promise.resolve(blogPromise).then(function (doc) {
                if ((doc && doc.status === 0) || !doc) {
                    return new Error("找不到文章");
                }
                if (doc.ismd) {
                    doc.content = md.render(doc.content);
                }
                res.cookie('visited' + blogId, visited, { maxAge: 1000 * 60 * 60 * 24 * 2, httpOnly: false });
                return {
                    blog: doc,
                    newList: list.newList,
                    topList: list.topList,
                    friendLinks: list.friendLink,
                    categories: list.category,
                    description: doc.content.replace(/<\/?.+?>/g, "").substring(0, 300)
                };
            });
        });
    };
    Routes.catalog = function (req, res) {
        var catalogPromise = blog_model_1.default.find({ status: 1 }, 'title createdAt pv', { sort: { _id: -1 } });
        return getNewTopFriend().then(function (list) {
            return Promise.resolve(catalogPromise)
                .then(function (catalog) {
                return {
                    catalog: catalog,
                    newList: list.newList,
                    topList: list.topList,
                    friendLinks: list.friendLink,
                    categories: list.category
                };
            });
        });
    };
    ;
    Routes.weibo = function (req, res) {
        return getNewTopFriend().then(function (list) {
            return {
                newList: list.newList,
                topList: list.topList,
                friendLinks: list.friendLink,
                categories: list.category
            };
        });
    };
    ;
    Routes.about = function (req, res) {
        return getNewTopFriend().then(function (list) {
            return Promise.resolve(about_model_1.default.findOne())
                .then(function (about) {
                var resume = new about_model_1.default({
                    nickname: "",
                    job: "",
                    addr: "",
                    tel: "",
                    email: "",
                    resume: "",
                    other: ""
                });
                if (!about) {
                    about = resume;
                }
                return {
                    config: about,
                    newList: list.newList,
                    topList: list.topList,
                    friendLinks: list.friendLink,
                    categories: list.category
                };
            });
        });
    };
    ;
    Routes.gallery = function (req, res) {
        if (req.query.pass === settings.gallery_pass) {
            return Promise.resolve(settings.LEACLOUD);
        }
        else {
            res.render('error', {
                message: "您无权限访问！",
                error: {}
            });
        }
    };
    ;
    Routes.resume = function (req, res) {
        return resume_model_1.default.findOne().exec()
            .then(function (resume) {
            if (resume && resume.state === 1) {
                return Promise.resolve({});
            }
            else {
                return Promise.reject(new Error("暂停访问！"));
            }
        });
    };
    ;
    Routes.quicknote = function (req, res) {
        return getNewTopFriend().then(function (list) {
            return Promise.resolve(quick_note_model_1.default.find(null, null, { sort: { '_id': -1 } }))
                .then(function (quicknote) {
                return {
                    quickNoteList: quicknote,
                    newList: list.newList,
                    topList: list.topList,
                    friendLinks: list.friendLink,
                    categories: list.category
                };
            });
        });
    };
    ;
    Routes.updateTime = function (req, res) {
        return blog_model_1.default.find({ createdAt: { $type: 2 } }).then(function (blogs) {
            return Promise.each(blogs, function (item, index) {
                var time = new Date(item.createdAt);
                item.set("createdAt", time);
                console.log(">>>>>>>>>", item.createdAt);
                return item.save();
            });
        });
    };
    ;
    __decorate([
        route_1.route({
            path: "/"
        })
    ], Routes, "index", null);
    __decorate([
        route_1.route({
            path: ":id"
        })
    ], Routes, "blogdetail", null);
    __decorate([
        route_1.route({})
    ], Routes, "catalog", null);
    __decorate([
        route_1.route({})
    ], Routes, "weibo", null);
    __decorate([
        route_1.route({})
    ], Routes, "about", null);
    __decorate([
        route_1.route({})
    ], Routes, "gallery", null);
    __decorate([
        route_1.route({})
    ], Routes, "resume", null);
    __decorate([
        route_1.route({})
    ], Routes, "quicknote", null);
    __decorate([
        route_1.route({ json: true })
    ], Routes, "updateTime", null);
    return Routes;
}());
exports.default = Routes;
var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
var latestTop = blog_model_1.default.find({ status: 1, createdAt: { $gt: twoMonth } }, null, { sort: { _id: -1 }, limit: 5 }).exec();
var visitedTop = viewer_log_model_1.default.aggregate({ $match: { createdAt: { $gt: twoMonth } } }, { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } }, { $sort: { createAt: -1 } }).sort({ pv: -1 }).limit(5).exec();
var friendLink = friend_link_model_1.default.find({ state: 1 }).exec();
var categies = category_model_1.default.find().exec();
var promisies = [latestTop, visitedTop, friendLink, categies];
function getNewTopFriend() {
    return Promise.all(promisies).then(function (_a) {
        var newList = _a[0], topList = _a[1], friendLink = _a[2], category = _a[3];
        return {
            newList: newList,
            topList: topList,
            friendLink: friendLink,
            category: category
        };
    });
}
function log(err) {
    var msg = new message_1.default(settings.errorAlert, "\u9519\u8BEF\u63D0\u9192", null, err.message);
    msg.send().then(function (data) {
        debug(">>>>>", data);
    });
}
//# sourceMappingURL=article.js.map