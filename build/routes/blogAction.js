var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const async = require('async');
const moment = require('moment');
const Blog_1 = require('../models/Blog');
const QuickNote_1 = require('../models/QuickNote');
var md = require('markdown-it')();
const route_1 = require('../utils/route');
const settings = require('../settings');
var config = settings.blog_config;
class Routes {
    latestTop(callback) {
        var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
        Blog_1.default.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err, docs2) {
            if (err)
                callback(err.message);
            callback(null, docs2);
        });
    }
    visitedTop(callback) {
        Blog_1.default.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err, docs3) {
            if (err)
                callback(err.message);
            callback(null, docs3);
        });
    }
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
        async.parallel([
            function (callback) {
                Blog_1.default.find(condition, null, {
                    sort: { '_id': -1 },
                    skip: pageIndex * pageSize,
                    limit: pageSize
                }, function (err, docs) {
                    if (err)
                        res.send(err.message);
                    docs.forEach(function (item, index) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                        else {
                            item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                    });
                    callback(null, docs);
                });
            },
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            },
            function (callback) {
                Blog_1.default.count(condition, function (err, count) {
                    callback(null, count);
                });
            }
        ], function (err, result) {
            if (err)
                res.send(err.message);
            res.render('index', {
                config: config,
                blogList: result[0],
                newList: result[1],
                topList: result[2],
                pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                totalIndex: result[3],
                pageSize: pageSize,
                pageCount: result[0].length,
                category: category
            });
        });
    }
    ;
    static blogDetail(req, res) {
        async.parallel([
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            }
        ], function (err, result) {
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
                        newList: result[0],
                        topList: result[1],
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
                        newList: result[0],
                        topList: result[1],
                        blog: doc
                    });
                });
            }
        });
    }
    ;
    static catalog(req, res) {
        async.parallel([
            function (callback) {
                Blog_1.default.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err, list) {
                    callback(null, list);
                });
            },
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            }
        ], function (err, result) {
            if (err)
                res.send(err.message);
            res.render('catalog', {
                config: config,
                catalog: result[0],
                newList: result[1],
                topList: result[2]
            });
        });
    }
    ;
    static weibo(req, res) {
        async.parallel([
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            }
        ], function (err, result) {
            if (err)
                res.send(err.message);
            res.render('weibo', {
                config: config,
                newList: result[0],
                topList: result[1]
            });
        });
    }
    ;
    static about(req, res) {
        async.parallel([
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            }
        ], function (err, result) {
            if (err)
                res.send(err.message);
            res.render('about', {
                config: config,
                newList: result[0],
                topList: result[1]
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
        async.parallel([
            function (callback) {
                latestTop(callback);
            },
            function (callback) {
                visitedTop(callback);
            },
            function (callback) {
                QuickNote_1.default.find(null, null, {
                    sort: { '_id': -1 }
                }, function (err, docs) {
                    callback(err, docs);
                });
            }
        ], function (err, result) {
            if (err)
                res.send(err.message);
            res.render('quicknote', {
                config: config,
                newList: result[0],
                topList: result[1],
                quickNoteList: result[2]
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
function latestTop(callback) {
    var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
    Blog_1.default.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err, docs2) {
        if (err)
            callback(err.message);
        callback(null, docs2);
    });
}
function visitedTop(callback) {
    Blog_1.default.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err, docs3) {
        if (err)
            callback(err.message);
        callback(null, docs3);
    });
}
//# sourceMappingURL=blogAction.js.map