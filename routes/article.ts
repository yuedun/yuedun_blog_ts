import * as async from 'async';
import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as Resume, IResume as ResumeInstance } from '../models/about-model';
import { default as QuickNote } from '../models/quick-note-model';
import { default as ViewerLogModel, IViewerLog as ViewerLogInstance } from '../models/viewer-log-model';
import * as Markdown from 'markdown-it';
import * as Debug from 'debug';
var debug = Debug('yuedun:article');
var md = Markdown({
    highlight: function (str, lang) {
        if (lang) {
            return `<pre class="prettyprint ${lang}"><code>${str}</code></pre>`;
        }
        return `<pre class="prettyprint"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
});
import { route } from '../utils/route';
import * as settings from '../settings';

export default class Routes {
    /* 首页 */
    @route({
        path: "/"
    })
    static index(req: Request, res: Response): Promise.Thenable<any> {
        var pageIndex = 0;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? Number(req.query.pageIndex) : pageIndex;
        pageSize = req.query.pageSize ? Number(req.query.pageSize) : pageSize;
        var category = req.query.category;
        var condition: any = {
            status: 1
        }
        if (category) {
            condition.category = category;
        }
        return Promise.all([
            Blog.find(condition, null, { sort: { '_id': -1 }, skip: pageIndex * pageSize, limit: pageSize }),
            //最新列表
            latestTop,
            //浏览量排行
            visitedTop,
            Blog.count(condition)
        ]).then(([docs, result2, result3, result4]: [Array<BlogInstance>, Array<BlogInstance>, Array<BlogInstance>, number]) => {
            docs.forEach(function (item, index) {
                if (item.ismd) {
                    item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                } else {
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
                category: category
            };
        })
    };

    /**
     * 获取博客详情，并且浏览数+1,同一ip2小时内浏览多次不增加浏览次数
     */
    @route({
        path: ":id"
    })
    static blogdetail(req: Request, res: Response): Promise.Thenable<any> {
        let blogId = req.params.id;
        let ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let visited = ip + blogId;
        let blogPromise: Promise.Thenable<BlogInstance>;
        if (req.cookies['visited' + blogId]) {
            blogPromise = Blog.findById(req.params.id);
        } else {
            blogPromise = Blog.findByIdAndUpdate(req.params.id, { $inc: { pv: 1 } })
        }
        return Promise.all([
            latestTop,
            visitedTop,
            blogPromise
        ]).then(([result1, result2, doc]) => {
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
    /* 博客目录 */
    @route({})
    static catalog(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            Blog.find({ status: 1 }, 'title createDate pv', { sort: { createDate: -1 } }),
            latestTop,
            visitedTop
        ]).then(([result1, result2, result3]) => {
            return {
                catalog: result1,
                newList: result2,
                topList: result3
            };
        })
    };
    /* 我的微博 */
    @route({})
    static weibo(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            latestTop,
            visitedTop
        ]).then(([result1, result2]) => {
            return {
                newList: result1,
                topList: result2
            };
        })
    };
    /* 关于我 */
    @route({})
    static about(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            latestTop,
            visitedTop,
            Resume.findOne()
        ]).then(([result1, result2, result3]) => {
            var resume = new Resume({
                nickname: "",
                job: "",
                addr: "",
                tel: "",
                email: "",
                resume: "",
                other: ""
            })
            if (!result3) {
                result3 = resume;
            }
            return {
                config: result3,
                newList: result1,
                topList: result2,
            };
        })
    };

    //婚纱
    @route({})
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
    @route({})
    static resume(req: Request, res: Response): Promise.Thenable<any> {
        debug("*****resume:" + moment().format("YYYY-MM-DD HH:ss:mm"));
        return Promise.resolve({});
    };

    //速记本
    @route({})
    static quicknote(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.all([
            latestTop,
            visitedTop,
            QuickNote.find(null, null, { sort: { '_id': -1 } })
        ]).then(([result1, result2, result3]) => {
            return {
                newList: result1,
                topList: result2,
                quickNoteList: result3
            };
        })
    };
}
//最近新建
var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
var latestTop = Blog.find({ 'status': "1", createDate: { $gt: twoMonth } }, null, { sort: { '_id': -1 }, limit: 5 }).exec();

//近两月访问最多
var visitedTop = ViewerLogModel.aggregate(
    { $match: { createdAt: { $gt: twoMonth } } },
    { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } },
    { $sort: { createAt: -1 } }
).sort({ pv: -1 }).limit(5);
/**
 * Blog.find(条件, 字段, 排序、limit)
 */