import * as async from 'async';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/Blog';
import { default as QuickNote }  from '../models/QuickNote';
var md = require('markdown-it')();
import {route} from '../utils/route';
import * as settings from '../settings';
var config = settings.blog_config;

export class Routes {
    //最新,近两月
    latestTop(callback) {
        var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
        Blog.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err:any, docs2) {
            if (err) callback(err.message);
            callback(null, docs2);
        });
    }
    //访问最多
    visitedTop(callback) {
        Blog.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err:any, docs3) {
            if (err) callback(err.message);
            callback(null, docs3);
        });
    }
    /* 首页 */
    @route({
        path: "/",
        method: "get"
    })
    static default(req, res) {
        var pageIndex = 0;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : pageIndex;
        pageSize = req.query.pageSize ? Number(req.query.pageSize) : pageSize;
        var category = req.query.category;
        var condition = {
            status: 1,
            category: ''
        }
        if (category != "" && category != null) {
            condition.category = category;
        }
        async.parallel([
            function (callback) {
                //博客列表find(条件，字段，)
                Blog.find(condition, null, {
                    sort: { '_id': -1 },
                    skip: pageIndex * pageSize,
                    limit: pageSize
                }, function (err:any, docs) {
                    if (err) res.send(err.message);
                    docs.forEach(function (item, index) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        } else {
                            item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                    });
                    callback(null, docs);
                });
            },
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            },
            function (callback) {
                Blog.count(condition, function (err:any, count) {
                    callback(null, count);
                })
            }
        ], function (err:any, result) {
            if (err) res.send(err.message);
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
    };

    /**
     * 获取博客详情，并且浏览数+1,同一ip2小时内浏览多次不增加浏览次数
     */
    @route({
        path: "/blogdetail/:id",
        method: "get"
    })
    static blogDetail(req, res) {
        async.parallel([
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            }
        ], function (err:any, result) {
            var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var blogId = req.params.id;
            var visitor = ip + blogId;
            if (req.cookies[visitor + blogId]) {
                Blog.findById(req.params.id, function (err:any, doc) {
                    if (err) res.send(err.message);
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
            } else {
                Blog.findByIdAndUpdate(req.params.id, {
                    $inc: { pv: 1 }
                }, function (err:any, doc) {
                    if (err) res.send(err.message);
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
    };
    /* 博客目录 */
    @route({
        path: "/catalog",
        method: "get"
    })
    static catalog(req, res) {
        async.parallel([
            function (callback) {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err:any, list) {
                    callback(null, list);
                });
            },
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            }
        ], function (err:any, result) {
            if (err) res.send(err.message);
            res.render('catalog', {
                config: config,
                catalog: result[0],
                newList: result[1],
                topList: result[2]
            });
        })
    };
    /* 我的微博 */
    @route({
        path: "/weibo",
        method: "get"
    })
    static weibo(req, res) {
        async.parallel([
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            }
        ], function (err:any, result) {
            if (err) res.send(err.message);
            res.render('weibo', {
                config: config,
                newList: result[0],
                topList: result[1]
            });
        })
    };
    /* 关于我 */
    @route({
        path: "/about",
        method: "get"
    })
    static about(req, res) {
        async.parallel([
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            }
        ], function (err:any, result) {
            if (err) res.send(err.message);
            res.render('about', {
                config: config,
                newList: result[0],
                topList: result[1]
            });
        })
    };

    //婚纱
    @route({
        path: "/gallery",
        method: "get"
    })
    static gallery(req, res) {
        res.render("gallery", {});
    };
    //简历
    @route({
        path: "/resume",
        method: "get"
    })
    static resume(req, res) {
        console.log("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        res.render("resume", {});
    };

    //速记本
    @route({
        path: "/quicknote",
        method: "get"
    })
    static quicknote(req, res) {
        async.parallel([
            function (callback) {
                //最新列表
                latestTop(callback);
            },
            function (callback) {
                //浏览量排行
                visitedTop(callback);
            },
            function (callback) {
                QuickNote.find(null, null, {
                    sort: { '_id': -1 }
                }, function (err:any, docs) {
                    callback(err, docs);
                });
            }
        ], function (err:any, result) {
            if (err) res.send(err.message);
            res.render('quicknote', {
                config: config,
                newList: result[0],
                topList: result[1],
                quickNoteList: result[2]
            });
        })
    };
}

//最新,近两月
function latestTop(callback) {
    var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
    Blog.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err:any, docs2) {
        if (err) callback(err.message);
        callback(null, docs2);
    });
}
//访问最多
function visitedTop(callback) {
    Blog.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err:any, docs3) {
        if (err) callback(err.message);
        callback(null, docs3);
    });
}