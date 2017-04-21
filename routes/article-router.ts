import * as async from 'async';
import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/Blog';
import { default as QuickNote } from '../models/QuickNote';
import * as Markdown from 'markdown-it';
var md = Markdown();
import { route } from '../utils/route';
import * as settings from '../settings';
var config = settings.blog_config;

export default class Routes {
    /* 首页 */
    @route({
        path: "/",
        method: "get"
    })
    static index(req: Request, res: Response) {
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
        Promise.all([
            new Promise(function (resolve, reject) {
                Blog.find(condition, null, {
                    sort: { '_id': -1 },
                    skip: pageIndex * pageSize,
                    limit: pageSize
                }, function (err: any, docs) {
                    if (err) reject(err.message);
                    docs.forEach(function (item, index) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        } else {
                            item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                    });
                    resolve(docs);
                });
            }),
            //最新列表
            latestTop(),
            //浏览量排行
            visitedTop(),
            new Promise((resolve, reject) => {
                Blog.count(condition, function (err: any, count) {
                    resolve(count);
                })
            })
        ]).then(([result1, result2, result3, result4]: [Array<BlogInstance>, Array<BlogInstance>, Array<BlogInstance>, number]) => {
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
        })
    };

    /**
     * 获取博客详情，并且浏览数+1,同一ip2小时内浏览多次不增加浏览次数
     */
    @route({
        path: "/blogdetail/:id",
        method: "get"
    })
    static blogDetail(req: Request, res: Response) {
        Promise.all([
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            var ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var blogId = req.params.id;
            var visitor = ip + blogId;
            if (req.cookies[visitor + blogId]) {
                Blog.findById(req.params.id, function (err: any, doc) {
                    if (err) res.send(err.message);
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
            } else {
                Blog.findByIdAndUpdate(req.params.id, {
                    $inc: { pv: 1 }
                }, function (err: any, doc) {
                    if (err) res.send(err.message);
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
        })
    };
    /* 博客目录 */
    @route({
        path: "/catalog",
        method: "get"
    })
    static catalog(req: Request, res: Response) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
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
        })
    };
    /* 我的微博 */
    @route({
        path: "/weibo",
        method: "get"
    })
    static weibo(req: Request, res: Response) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            res.render('weibo', {
                config: config,
                newList: result1,
                topList: result2
            });
        })
    };
    /* 关于我 */
    @route({
        path: "/about",
        method: "get"
    })
    static about(req: Request, res: Response) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop(),
            visitedTop()
        ]).then(([result1, result2]) => {
            res.render('about', {
                config: config,
                newList: result1,
                topList: result2
            });
        })
    };

    //婚纱
    @route({
        path: "/gallery",
        method: "get"
    })
    static gallery(req: Request, res: Response) {
        res.render("gallery", {});
    };

    //简历
    @route({
        path: "/resume",
        method: "get"
    })
    static resume(req: Request, res: Response) {
        console.log("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        res.render("resume", {});
    };

    //速记本
    @route({
        path: "/quicknote",
        method: "get"
    })
    static quicknote(req: Request, res: Response) {
        Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop(),
            visitedTop(),
            new Promise((resolve, reject) => {
                QuickNote.find(null, null, {
                    sort: { '_id': -1 }
                }, function (err: any, docs) {
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
        })
    };
}
//最近新建
var latestTop = function () {
    return new Promise((resolve, reject) => {
        var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
        Blog.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }, function (err: any, docs2) {
            if (err) reject(err.message);
            resolve(docs2);
        });
    });
}
//访问最多
var visitedTop = function () {
    return new Promise((resolve, reject) => {
        Blog.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }, function (err: any, docs3) {
            if (err) reject(err.message);
            resolve(docs3);
        });
    });
}