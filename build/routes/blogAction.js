var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const Promise = require("bluebird");
const moment = require("moment");
const Blog_1 = require("../models/Blog");
const QuickNote_1 = require("../models/QuickNote");
var md = require('markdown-it')();
const route_1 = require("../utils/route");
const settings = require("../settings");
var config = settings.blog_config;
class Routes {
    static index(req, res) {
        var pageIndex = 0;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : pageIndex;
        pageSize = req.query.pageSize ? Number(req.query.pageSize) : pageSize;
        var category = req.query.category;
        var condition = {
            status: 1,
            category: ''
        };
        if (category != "" && category != null) {
            condition.category = category;
        }
        Promise.all([
            new Promise(function (resolve, reject) {
                Blog_1.default.find(condition, null, {
                    sort: { '_id': -1 },
                    skip: pageIndex * pageSize,
                    limit: pageSize
                }, function (err, docs) {
                    if (err)
                        reject(err.message);
                    docs.forEach(function (item, index) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                        else {
                            item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                    });
                    resolve(docs);
                });
            }),
            latestTop(),
            visitedTop(),
            new Promise((resolve, reject) => {
                Blog_1.default.count(condition, function (err, count) {
                    resolve(count);
                });
            })
        ]).then(([result1, result2, result3, result4]) => {
            res.render('index', {
                config: config,
                blogList: result1,
                newList: result2,
                topList: result3,
                pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                totalIndex: result4,
                pageSize: pageSize,
                pageCount: result1.length,
                category: category
            });
        });
    }
    ;
    static blogDetail(req, res) {
        Promise.all([
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var blogId = req.params.id;
            var visitor = ip + blogId;
            if (req.cookies[visitor + blogId]) {
                Blog_1.default.findById(req.params.id, function (err, doc) {
                    if (err)
                        res.send(err.message);
                    if (doc.ismd) {
                        doc.content = md.render(doc.content);
                    }
                    res.render('blogdetail', {
                        config: config,
                        newList: result1,
                        topList: result2,
                        blog: doc
                    });
                });
            }
            else {
                Blog_1.default.findByIdAndUpdate(req.params.id, {
                    $inc: { pv: 1 }
                }, function (err, doc) {
                    if (err)
                        res.send(err.message);
                    if (doc.ismd) {
                        doc.content = md.render(doc.content);
                    }
                    res.cookie('visitor' + blogId, visitor, { maxAge: 1000 * 60 * 60 * 8, httpOnly: true });
                    res.render('blogdetail', {
                        config: config,
                        newList: result1,
                        topList: result2,
                        blog: doc
                    });
                });
            }
        });
    }
    ;
    static catalog(req, res) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog_1.default.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err, list) {
                    resolve(list);
                });
            }),
            latestTop(),
            visitedTop()
        ]).then(([result1, result2, result3]) => {
            res.render('catalog', {
                config: config,
                catalog: result1,
                newList: result2,
                topList: result3
            });
        });
    }
    ;
    static weibo(req, res) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog_1.default.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err, list) {
                    resolve(list);
                });
            }),
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            res.render('weibo', {
                config: config,
                newList: result1,
                topList: result2
            });
        });
    }
    ;
    static about(req, res) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog_1.default.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err, list) {
                    resolve(list);
                });
            }),
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            res.render('about', {
                config: config,
                newList: result1,
                topList: result2
            });
        });
    }
    ;
    static gallery(req, res) {
        res.render("gallery", {});
    }
    ;
    static resume(req, res) {
        console.log("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        res.render("resume", {});
    }
    ;
    static quicknote(req, res) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog_1.default.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err, list) {
                    resolve(list);
                });
            }),
            latestTop(),
            visitedTop(),
            new Promise((resolve, reject) => {
                QuickNote_1.default.find(null, null, {
                    sort: { '_id': -1 }
                }, function (err, docs) {
                    resolve(docs);
                });
            })
        ]).then(([result1, result2, result3]) => {
            res.render('quicknote', {
                config: config,
                newList: result1,
                topList: result2,
                quickNoteList: result3
            });
        });
    }
    ;
}
__decorate([
    route_1.route({
        path: "/",
        method: "get"
    })
], Routes, "index", null);
__decorate([
    route_1.route({
        path: "/blogdetail/:id",
        method: "get"
    })
], Routes, "blogDetail", null);
__decorate([
    route_1.route({
        path: "/catalog",
        method: "get"
    })
], Routes, "catalog", null);
__decorate([
    route_1.route({
        path: "/weibo",
        method: "get"
    })
], Routes, "weibo", null);
__decorate([
    route_1.route({
        path: "/about",
        method: "get"
    })
], Routes, "about", null);
__decorate([
    route_1.route({
        path: "/gallery",
        method: "get"
    })
], Routes, "gallery", null);
__decorate([
    route_1.route({
        path: "/resume",
        method: "get"
    })
], Routes, "resume", null);
__decorate([
    route_1.route({
        path: "/quicknote",
        method: "get"
    })
], Routes, "quicknote", null);
exports.Routes = Routes;
var latestTop = function () {
    return new Promise((resolve, reject) => {
        var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
        Blog_1.default.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err, docs2) {
            if (err)
                reject(err.message);
            resolve(docs2);
        });
    });
};
var visitedTop = function () {
    return new Promise((resolve, reject) => {
        Blog_1.default.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err, docs3) {
            if (err)
                reject(err.message);
            resolve(docs3);
        });
    });
};
//# sourceMappingURL=blogAction.js.map