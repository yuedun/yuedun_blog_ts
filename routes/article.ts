import * as async from 'async';
import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as QuickNote } from '../models/quick-note-model';
import * as Markdown from 'markdown-it';
import * as Debug from 'debug';
var debug = Debug('yuedun:article');
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
    static index(req: Request, res: Response): Promise.Thenable<any> {
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
        return Promise.all([
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
            latestTop,
            //浏览量排行
            visitedTop,
            new Promise((resolve, reject) => {
                Blog.count(condition, function (err: any, count) {
                    resolve(count);
                })
            })
        ]).then(([result1, result2, result3, result4]: [Array<BlogInstance>, Array<BlogInstance>, Array<BlogInstance>, number]) => {
            return {
                config: config,
                blogList: result1,
                newList: result2,
                topList: result3,
                pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                totalIndex: result4,
                pageSize: pageSize,
                pageCount: result1.length,
                category: category
            };
        })
    };

    /**
     * 获取博客详情，并且浏览数+1,同一ip2小时内浏览多次不增加浏览次数
     */
    @route({
        path: "/blogdetail/:id",
        method: "get"
    })
    static blogDetail(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            latestTop,
            visitedTop
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
                    return {
                        config: config,
                        newList: result1,
                        topList: result2,
                        blog: doc
                    };
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
                    return {
                        config: config,
                        newList: result1,
                        topList: result2,
                        blog: doc
                    };
                });
            }
        })
    };
    /* 博客目录 */
    @route({
        path: "/catalog",
        method: "get"
    })
    static catalog(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop,
            visitedTop
        ]).then(([result1, result2, result3]) => {
            return {
                config: config,
                catalog: result1,
                newList: result2,
                topList: result3
            };
        })
    };
    /* 我的微博 */
    @route({
        path: "/weibo",
        method: "get"
    })
    static weibo(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop,
            visitedTop
        ]).then(([result1, result2]) => {
            return {
                config: config,
                newList: result1,
                topList: result2
            };
        })
    };
    /* 关于我 */
    @route({
        path: "/about",
        method: "get"
    })
    static about(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop,
            visitedTop
        ]).then(([result1, result2]) => {
            return {
                config: config,
                newList: result1,
                topList: result2
            };
        })
    };

    //婚纱
    @route({
        path: "/gallery",
        method: "get"
    })
    static gallery(req: Request, res: Response): Promise.Thenable<any> {
        if (req.query.pass === settings.gallery_pass) {
            return Promise.resolve(settings.LEACLOUD);
        } else {
            res.render('error', {
                message: "您无权限访问！",
                error: {}
            });
        }
    };

    //简历
    @route({
        path: "/resume",
        method: "get"
    })
    static resume(req: Request, res: Response): Promise.Thenable<any> {
        debug("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        return null;
    };

    //速记本
    @route({
        path: "/quicknote",
        method: "get"
    })
    static quicknote(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            new Promise((resolve, reject) => {
                Blog.find({}, 'title createDate pv', { sort: { createDate: -1 } }, function (err: any, list) {
                    resolve(list);
                })
            }),
            latestTop,
            visitedTop,
            new Promise((resolve, reject) => {
                QuickNote.find(null, null, {
                    sort: { '_id': -1 }
                }, function (err: any, docs) {
                    resolve(docs);
                });
            })
        ]).then(([result1, result2, result3]) => {
            return {
                config: config,
                newList: result1,
                topList: result2,
                quickNoteList: result3
            };
        })
    };
}
//最近新建
var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
var latestTop = Blog.find({ 'status': 1, createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }).exec();

//访问最多
var visitedTop = Blog.find({ 'status': 1 }, null, { sort: { 'pv': -1 }, limit: 5 }).exec();