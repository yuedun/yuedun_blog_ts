import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as About } from '../models/about-model';
import { default as QuickNote } from '../models/quick-note-model';
import { default as ViewerLogModel } from '../models/viewer-log-model';
import { default as FriendLinkModel, IFriendLink as FriendLinkInstance } from '../models/friend-link-model';
import { default as ResumeModel } from '../models/resume-model';
import { default as CategoryModel, ICategory as CategoryInstance } from '../models/category-model';
import { default as MessageModel, IMessage } from '../models/message-model';
import * as Markdown from 'markdown-it';
import * as Debug from 'debug';
import { route, RedirecPage } from '../utils/route';
import * as settings from '../settings';
var debug = Debug('yuedun:article');
var md = Markdown({
    highlight: function (str, lang) {
        if (lang) {
            return `<pre class="prettyprint ${lang}"><code>${str}</code></pre>`;
        }
        return `<pre class="prettyprint"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
});

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
        var blogPromise = Promise.resolve(Blog.find(condition, null, { sort: { _id: -1 }, skip: pageIndex * pageSize, limit: pageSize }).exec());

        return Promise.all([blogPromise, Blog.count(condition).exec()])
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
                    pageIndex: req.query.pageIndex ? req.query.pageIndex : pageIndex,
                    pageSize: pageSize,
                    pageCount: blogList.length,
                    category: category,
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
            blogPromise = Blog.findById(req.params.id).exec();
        } else {
            blogPromise = Blog.findByIdAndUpdate(req.params.id, { $inc: { pv: 1 } }).exec();
        }

        return Promise.resolve(blogPromise).then(doc => {
            if ((doc && doc.status === 0) || !doc) {
                new Error("找不到文章");
            }
            return Blog.find({ status: 1, category: doc.category }, 'title', { sort: { _id: -1 } }).exec().then(cats => {
                if (doc.ismd) {
                    doc.content = md.render(doc.content);
                }
                res.cookie('visited' + blogId, visited, { maxAge: 1000 * 60 * 60 * 24 * 2, httpOnly: false });
                return {
                    blog: doc,
                    description: doc.content.replace(/<\/?.+?>/g, "").substring(0, 300),
                    sameCategories: cats,
                    category: doc.category,
                }
            })

        }).catch(err => {
            return {
                blog: null,
                description: null,
                sameCategories: null
            }
        })
    }
    /* 博客目录 */
    @route({})
    static catalog(req: Request, res: Response): Promise.Thenable<any> {
        var catalogPromise = Blog.find({ status: 1 }, 'title createdAt pv', { sort: { _id: -1 } }).exec();
        return Promise.resolve(catalogPromise)
            .then(catalog => {
                return {
                    catalog,
                };
            })
    };
    /* 我的微博 */
    @route({})
    static weibo(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve({});
    };
    /* 关于我 */
    @route({})
    static about(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve(About.findOne().exec())
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
        return ResumeModel.findOne().exec()
            .then(resume => {
                if (resume && resume.state === 1) {
                    return Promise.resolve({
                        resumeContent: resume.content
                    });
                } else {
                    return Promise.reject(new Error("暂停访问！"))
                }
            })
    };

    //速记本
    @route({})
    static quicknote(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve(QuickNote.find(null, null, { sort: { '_id': -1 } }).exec())
            .then(quicknote => {
                return {
                    quickNoteList: quicknote,
                };
            })
    };

    //留言列表
    @route({})
    static message(req: Request, res: Response): Promise.Thenable<any> {
        let blogId = req.query.blogId;
        let condition: any = {};
        if (blogId) {
            condition.replyid = blogId;
        }
        return MessageModel.find(condition)
            .then(data => {
                debug(">>>>>>>>>>>.", data)
                data.forEach(element => {
                    element.createdDate = moment(element.createdAt).format('YYYY-MM-DD HH:mm:SS')
                });
                return {
                    messageList: data,
                    replyid: blogId,
                };
            });
    };
    //留言
    @route({
        method: 'post'
    })
    static messagePost(req: Request, res: Response): Promise.Thenable<RedirecPage> {
        let args = req.body;
        debug(args);
        return MessageModel.create(args)
            .then(data => {
                debug(">>>>>>>>>>>", data)
                return new RedirecPage('/message');
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
var twoMonth = function () {
    return moment().subtract(2, "month").toDate();
}
var latestTop = function () {
    return Blog.find({ status: 1, createdAt: { $gt: twoMonth() } }, null, { sort: { _id: -1 }, limit: 5 }).exec();
}

//近两月访问最多
var visitedTop = function () {
    return ViewerLogModel.aggregate([
        { $match: { createdAt: { $gt: twoMonth() } } },
        { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } },
        { $sort: { createAt: -1 } }
    ]).sort({ pv: -1 }).limit(5).exec();
}
/**
 * Blog.find(条件, 字段, 排序、limit)
 */
//获取友链
var friendLink = function () {
    return FriendLinkModel.find({ state: 1 }).exec();
}

//所有分类
var categies = function () {
    return CategoryModel.find().exec();
}

interface CommonList {
    newList: Array<BlogInstance>;
    topList: Array<BlogInstance>;
    friendLink: Array<FriendLinkInstance>;
    category: Array<CategoryInstance>;
}
//获取公共数据
export function getNewTopFriend(): Promise.Thenable<CommonList> {
    return Promise.all([latestTop(), visitedTop(), friendLink(), categies()]).then(([newList, topList, friendLink, category]) => {
        return {
            newList,
            topList,
            friendLink,
            category
        }
    })
}
