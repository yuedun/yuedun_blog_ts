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
var Markdown = require("markdown-it");
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
        return Promise.all([
            blog_model_1.default.find(condition, null, { sort: { '_id': -1 }, skip: pageIndex * pageSize, limit: pageSize }),
            latestTop,
            visitedTop,
            blog_model_1.default.count(condition),
            friendLink
        ]).then(function (_a) {
            var docs = _a[0], result2 = _a[1], result3 = _a[2], result4 = _a[3], result5 = _a[4];
            debug(result5);
            docs.forEach(function (item, index) {
                if (item.ismd) {
                    item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                }
                else {
                    item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                }
            });
            return {
                blogList: docs,
                newList: result2,
                topList: result3,
                pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                totalIndex: result4,
                pageSize: pageSize,
                pageCount: docs.length,
                category: category,
                friendLinks: result5
            };
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
        return Promise.all([
            latestTop,
            visitedTop,
            blogPromise
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1], doc = _a[2];
            if (doc.status === 0) {
                return new Error("找不到文章");
            }
            if (doc.ismd) {
                doc.content = md.render(doc.content);
            }
            res.cookie('visited' + blogId, visited, { maxAge: 1000 * 60 * 60 * 24 * 2, httpOnly: false });
            return {
                newList: result1,
                topList: result2,
                blog: doc
            };
        });
    };
    ;
    Routes.catalog = function (req, res) {
        return Promise.all([
            blog_model_1.default.find({ status: 1 }, 'title createdAt pv', { sort: { createdAt: -1 } }),
            latestTop,
            visitedTop
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1], result3 = _a[2];
            return {
                catalog: result1,
                newList: result2,
                topList: result3
            };
        });
    };
    ;
    Routes.weibo = function (req, res) {
        return Promise.all([
            latestTop,
            visitedTop
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1];
            return {
                newList: result1,
                topList: result2
            };
        });
    };
    ;
    Routes.about = function (req, res) {
        return Promise.all([
            latestTop,
            visitedTop,
            about_model_1.default.findOne()
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1], result3 = _a[2];
            var resume = new about_model_1.default({
                nickname: "",
                job: "",
                addr: "",
                tel: "",
                email: "",
                resume: "",
                other: ""
            });
            if (!result3) {
                result3 = resume;
            }
            return {
                config: result3,
                newList: result1,
                topList: result2,
            };
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
        debug("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        return Promise.resolve({});
    };
    ;
    Routes.quicknote = function (req, res) {
        return Promise.all([
            latestTop,
            visitedTop,
            quick_note_model_1.default.find(null, null, { sort: { '_id': -1 } })
        ]).then(function (_a) {
            var result1 = _a[0], result2 = _a[1], result3 = _a[2];
            return {
                newList: result1,
                topList: result2,
                quickNoteList: result3
            };
        });
    };
    ;
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
var latestTop = blog_model_1.default.find({ 'status': "1", createdAt: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }).exec();
var visitedTop = viewer_log_model_1.default.aggregate({ $match: { createdAt: { $gt: twoMonth } } }, { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } }, { $sort: { createAt: -1 } }).sort({ pv: -1 }).limit(5);
var friendLink = friend_link_model_1.default.find({ state: 1 }).exec();
//# sourceMappingURL=article.js.map