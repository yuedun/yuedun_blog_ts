import * as async from 'async';
import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as About, IAbout as AboutInstance } from '../models/about-model';
import { default as QuickNote } from '../models/quick-note-model';
import { default as ViewerLogModel, IViewerLog as ViewerLogInstance } from '../models/viewer-log-model';
import { default as FriendLinkModel, IFriendLink as FriendLinkInstance } from '../models/friend-link-model';
import { default as ResumeModel, IResume as ResumeInstance } from '../models/resume-model';
import { default as CategoryModel, ICategory as CategoryInstance } from '../models/category-model';
import * as Markdown from 'markdown-it';
import Message from "../utils/message";
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
        var blogPromise = Promise.resolve(Blog.find(condition, null, { sort: { _id: -1 }, skip: pageIndex * pageSize, limit: pageSize }));

        return getNewTopFriend().then(list => {
            return Promise.all([blogPromise, Blog.count(condition)])
                .then(([blogList, totalIndex]) => {
                    blogList.forEach(function (item, index) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        } else {
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
                })
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

        return getNewTopFriend().then(list => {
            return Promise.resolve(blogPromise).then(doc => {
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
                    categories: list.category
                }
            })
        })
    }
    /* 博客目录 */
    @route({})
    static catalog(req: Request, res: Response): Promise.Thenable<any> {
        var catalogPromise = Blog.find({ status: 1 }, 'title createdAt pv', { sort: { _id: -1 } })
        return getNewTopFriend().then(list => {
            return Promise.resolve(catalogPromise)
                .then(catalog => {
                    return {
                        catalog,
                        newList: list.newList,
                        topList: list.topList,
                        friendLinks: list.friendLink,
                        categories: list.category
                    };
                })
        });
    };
    /* 我的微博 */
    @route({})
    static weibo(req: Request, res: Response): Promise.Thenable<any> {
        return getNewTopFriend().then(list => {
            return {
                newList: list.newList,
                topList: list.topList,
                friendLinks: list.friendLink,
                categories: list.category
            };
        });
    };
    /* 关于我 */
    @route({})
    static about(req: Request, res: Response): Promise.Thenable<any> {
        return getNewTopFriend().then(list => {
            return Promise.resolve(About.findOne())
                .then(about => {
                    var resume = new About({
                        nickname: "",
                        job: "",
                        addr: "",
                        tel: "",
                        email: "",
                        resume: "",
                        other: ""
                    })
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
                })
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
        return ResumeModel.findOne().exec()
            .then(resume => {
                if (resume && resume.state === 1) {
                    return Promise.resolve({});
                } else {
                    return Promise.reject(new Error("暂停访问！"))
                }
            })
    };

    //速记本
    @route({})
    static quicknote(req: Request, res: Response): Promise.Thenable<any> {
        return getNewTopFriend().then(list => {
            return Promise.resolve(QuickNote.find(null, null, { sort: { '_id': -1 } }))
                .then(quicknote => {
                    return {
                        quickNoteList: quicknote,
                        newList: list.newList,
                        topList: list.topList,
                        friendLinks: list.friendLink,
                        categories: list.category
                    };
                })
        });
    };

    //临时使用
    @route({ json: true })
    static updateTime(req: Request, res: Response): Promise.Thenable<any> {
        return Blog.find({ createdAt: { $type: 2 } }).then(blogs => {
            return Promise.each(blogs, (item, index) => {
                // item.createdAt = moment(item.createdAt).toDate()
                let time = new Date(item.createdAt)
                item.set("createdAt", time)
                // item.createdAt = time;
                console.log(">>>>>>>>>", item.createdAt);
                // item.set("updatedAt", time)
                return item.save()
            })
        })
    };
}
//最近新建
var twoMonth = moment().subtract(2, "month").format("YYYY-MM-DD HH:ss:mm");
var latestTop = Blog.find({ status: 1, createdAt: { $gt: twoMonth } }, null, { sort: { _id: -1 }, limit: 5 }).exec();

//近两月访问最多
var visitedTop = ViewerLogModel.aggregate(
    { $match: { createdAt: { $gt: twoMonth } } },
    { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } },
    { $sort: { createAt: -1 } }
).sort({ pv: -1 }).limit(5).exec();
/**
 * Blog.find(条件, 字段, 排序、limit)
 */
//获取友链
var friendLink = FriendLinkModel.find({ state: 1 }).exec();

//所有分类
var categies = CategoryModel.find().exec();

var promisies: Array<any> = [latestTop, visitedTop, friendLink, categies];

interface CommonList {
    newList: Array<BlogInstance>;
    topList: Array<BlogInstance>;
    friendLink: FriendLinkInstance;
    category: CategoryInstance
}
//获取公共数据
function getNewTopFriend(): Promise.Thenable<CommonList> {
    return Promise.all(promisies).then(([newList, topList, friendLink, category]) => {
        return {
            newList,
            topList,
            friendLink,
            category
        }
    })
}
function log(err) {
    var msg = new Message(settings.errorAlert, `错误提醒`, null, err.message);
    msg.send().then(data => {
        debug(">>>>>", data)
    })
}