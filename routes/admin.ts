import * as _ from 'lodash';
import { Request, Response } from 'express';
import * as Moment from 'moment';//日期格式化组件
import * as Promise from 'bluebird';
import * as crypto from "crypto";
import * as Markdown from 'markdown-it';
import * as Debug from 'debug';
var debug = Debug('yuedun:admin');
import { default as User } from '../models/user-model';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as QuickNote } from '../models/quick-note-model';
import { default as Category, ICategory as CategoryInstance } from '../models/category-model';
import { default as WeatherUser } from '../models/weather-user-model';
import { default as About, IAbout as AboutInstance } from '../models/about-model';
import { default as ViewerLogModel, IViewerLog as ViewerLogInstance } from '../models/viewer-log-model';
import { default as FriendLinkModel, IFriendLink as FriendLinkInstance } from '../models/friend-link-model';
import { default as ResumeModel, IResume as ResumeInstance } from '../models/resume-model';
import * as qiniu from '../utils/qiniu';
var md = Markdown();
var area = require('../area');
import { route } from '../utils/route';

function generatorPassword(password: string): string {
    const hash = crypto.createHash('sha1');
    hash.update(password)
    return hash.digest("hex");
}
export default class Routes {
    /**
     * success0未修改，1成功
     * 
    **/

    /*进入后台主界面 */
    @route({})
    static index(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session && req.session.user ? req.session.user : null;
        if (user != null) {
            var today = Moment().format('YYYY-MM-DD');
            return Promise.all<any, number, any, any>([
                Blog.aggregate({ $group: { _id: null, pvCount: { $sum: '$pv' } } }),//聚合查询，总访问量,分组必须包含_id
                ViewerLogModel.count({ createdAt: { $regex: today, $options: 'i' } }),//模糊查询"%text%"，今日访问量
                ViewerLogModel.aggregate(
                    { $match: { createdAt: { $regex: today, $options: 'i' } } },
                    { $group: { _id: { blogId: '$blogId', title: "$title" }, pv: { $sum: 1 } } },
                    { $sort: { createAt: -1 } }
                ),
                ViewerLogModel.find({}, null, { sort: { _id: -1 }, limit: 10 })
            ]).then(([result1, result2, result3, result4]) => {
                return { readCount: result1[0].pvCount, todayRead: result2, recent: result3, newRead: result4 }
            })
        } else {
            return Promise.resolve({ title: '用户登录' });
        }
    }

    /* 后台登陆 */
    @route({})
    static login(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve({});
    }

    //登陆
    @route({
        method: "post"
    })
    static doLogin(req: Request, res: Response): any {
        var object = req.body;
        var user = {
            username: object.username,
            password: generatorPassword(object.password)
        }
        return User.findOne(user)
            .then(obj => {
                if (obj || process.env.NODE_ENV === 'development') {
                    req.session.user = user;
                    res.redirect('/admin/blogList')
                    return
                } else {
                    res.redirect('/admin/login')
                    return
                }
            })
    }

    /**
     * 新建文章页面
     */
    @route({})
    static newArticle(req: Request, res: Response): Promise.Thenable<any> {
        var token = qiniu.uptoken('hopefully');
        return Category.find({})
            .then(catotory => {
                return { success: 0, categories: catotory, token: token };
            })
    }

    /**
     * 新建文章页面-markdown方式
     */
    @route({})
    static newArticleMd(req: Request, res: Response): Promise.Thenable<any> {
        var token = qiniu.uptoken('hopefully');
        return Category.find({})
            .then(catogory => {
                return { success: 0, categories: catogory, token: token };
            });
    }
    /**
     * 新建文章
     * success代表新建成功时提示
     */
    @route({
        method: "post",
        json: true
    })
    static createArticle(req: Request, res: Response): Promise.Thenable<any> {
        var args = req.body;
        var blog = new Blog({
            title: args.title,//标题
            content: args.content, //内容
            status: parseInt(args.status),//发布，草稿，
            comments: [],//评论，可以在评论时添加
            commentCount: 0,
            category: args.category,//分类
            top: 0,//置顶
            tags: args.tags,//标签
            pv: 0,//浏览次数，可以在浏览时添加
            ismd: args.ismd
        });
        return Category.findOne({ cateName: args.category })
            .then(category => {
                if (!category) {
                    var category = new Category({
                        cateName: args.category,
                        state: true
                    });
                    return category.save();
                } else {
                    return category;
                }
            }).then(category => {
                return blog.save();
            }).then(() => {
                return { success: 1 };
            }).catch(err => {
                return { success: 0, msg: err }
            })
    }
    /**
     *文章列表
     */
    @route({})
    static blogList(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session ? req.session.user : null;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        let conditions: { title?: any } = {};
        if (req.query.title) {
            conditions.title = { $regex: req.query.title, $options: 'i' };
        }
        return Blog.find(conditions, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
            .then(docs => {
                docs.forEach(function (item, index) {
                    if (item.content) {
                        if (item.ismd) {
                            item.content = md.render(item.content).replace(/<\/?.+?>/g, "").substring(0, 300);
                        } else {
                            item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                        }
                    };
                });
                return {
                    success: success,
                    title: req.query.title,
                    blogList: docs,
                    user: user,
                    pageIndex: pageIndex,
                    pageCount: docs.length
                };
            })
    }
    /**
     * 查看单篇博客内容
     */
    @route({
        path: ":id"
    })
    static blogDetail(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session.user;
        return Blog.findById(req.params.id)
            .then(doc => {
                if (doc.ismd) {
                    doc.content = md.render(doc.content);
                }
                return { blog: doc, user: user };
            })
    }
    /**
     * 暂时约定edit跳转到编辑页面，update作修改操作
     * 跳转到修改文章
     */
    @route({
        path: ":id"
    })
    static editArticleMd(req: Request, res: Response): Promise.Thenable<any> {
        let getBlogById = Blog.findById(req.params.id);
        let getCategory = Category.find({});

        return Promise.all([getBlogById, getCategory])
            .then(([blogObj, categories]: [BlogInstance, CategoryInstance[]]) => {
                return { blog: blogObj, categories: categories }
            })
    }
    /**
     * 修改操作
     */
    @route({
        path: ":id",
        method: "post",
        json: true
    })
    static updateArticle(req: Request, res: Response): Promise.Thenable<any> {
        var args = req.body;
        let md = args.ismd ? 1 : 0;
        return Blog.findByIdAndUpdate(req.params.id, {
            $set: {
                title: args.title,
                content: args.content,
                category: args.category,
                tags: args.tags,
                status: parseInt(args.status),
                ismd: md
            }
        }).then(() => {
            return { success: 1 }
        })
    }

    /**
     * 删除文章
     */
    @route({
        path: ":id"
    })
    static deleteBlog(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session.user;
        return Blog.findByIdAndRemove(req.params.id)
            .then(doc => {
                res.redirect('/admin/blogList');
            })
    }

    /**
     * 分类
     */
    @route({})
    static category(req: Request, res: Response): Promise.Thenable<any> {
        return Category.find({})
            .then(docs => {
                return { cates: docs }
            });
    }

    @route({
        method: "post"
    })
    static addCategory(req: Request, res: Response): void {
        var category = new Category({
            cateName: req.body.cateName,
            state: true
        });
        category.save(function (e, docs, numberAffected) {
            if (e) res.send(e.message);
            res.redirect('/admin/category');
        });
    }
    /**
     * 删除分类
     */
    @route({
        path: ":id"
    })
    static deleteCate(req: Request, res: Response): void {
        var user = req.session.user;
        Category.findByIdAndRemove(req.params.id, function (err) {
            res.redirect('/admin/category');
        });
    }

    //添加用户界面
    @route({})
    static addUserUi(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve({ success: 0, flag: 0 });
    }

    /**
     * 新增用户
     */
    @route({
        method: "post",
        json: true
    })
    static addUser(req: Request, res: Response): Promise.Thenable<any> {
        var password = req.body.password;
        var user = new User({
            username: req.body.username,
            nickname: req.body.nickname,
            password: generatorPassword(password),
            level: 1,//权限级别，最高
            state: true,//可用/停用
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
        });
        return user.save()
            .then(() => {
                return { success: 1 }
            })
    }
    /**
     * 查看用户列表
     */
    @route({})
    static viewUser(req: Request, res: Response): void {
        User.find({}, null, function (err, docs) {
            if (err) res.send(err.message);
            res.render('admin/viewUser', { users: docs });
        });
    }
    /**
     * 跳转到修改页面success:0未成功1成功flag:0添加1修改
     */
    @route({
        path: ":userId"
    })
    static toModifyUser(req: Request, res: Response): void {
        User.findById(req.params.userId, function (err, doc) {
            if (err) res.send(err.message);
            res.render('admin/modifyUser', {
                user: doc,
                success: 0,
                flag: 1
            });
        });
    }
    /**
     * 进行修改用户
     * findByIdAndUpdate的callback函数有两个参数1错误信息，2修改后的对象
     */
    @route({
        path: ":userId",
        method: "post"
    })
    static modifyUser(req: Request, res: Response): void {
        User.findByIdAndUpdate(req.params.userId, {
            $set:
            {
                username: req.body.username,
                nickname: req.body.nickname,
                password: req.body.password,
                updateDate: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }, function (err, doc) {
            if (err) res.send(err.message);
            res.render('admin/modifyuser', { user: doc, success: 1, flag: 1 });
        });
    }
    /*
     *删除用户
     */
    @route({
        path: ":userId"
    })
    static deleteUser(req: Request, res: Response): void {
        User.remove({ _id: req.params.userId }, function (err) {
            res.redirect('/admin/viewUser');
        });
    }
    /*  登出  */
    @route({})
    static logout(req: Request, res: Response): void {
        req.session.destroy(function (err) {
            res.redirect('/admin/login');
            return;
        })
    }

    //添加天气用户界面
    @route({})
    static addWeatherUser(req: Request, res: Response): Promise.Thenable<any> {
        return Promise.resolve({ success: 0, flag: 0 });
    }
    /**
     * 新增天气预报用户
     */
    @route({
        method: "post"
    })
    static createWeatherUser(req: Request, res: Response): Promise.Thenable<any> {
        var args = req.body;
        // var areaObjs = JSON.parse(area);
        var areaId = _.result(_.find(area, { 'NAMECN': args.city }), 'AREAID');
        var weathUser = new WeatherUser({
            username: args.username,
            mobile: args.mobile,
            city: args.city,
            cityCode: areaId,
            sendCount: 0,
            status: 1,//1可用/0停用
            createAt: Moment().format('YYYY-MM-DD HH:mm:ss'),
        });
        return weathUser.save()
            .then(data => {
                res.redirect('/admin/weatherUserList');
            })
    }
    /**
     * 查看天气用户列表
     */
    @route({})
    static weatherUserList(req: Request, res: Response): Promise.Thenable<any> {
        return WeatherUser.find({}, null)
            .then(docs => {
                return { wusers: docs }
            })
    }

    /*
     *删除天气用户
     */
    @route({
        path: ":userId"
    })
    static delWeatherUser(req: Request, res: Response): Promise.Thenable<void> {
        return Promise.resolve(WeatherUser.remove({ _id: req.params.userId }))
            .then(d => {
                res.redirect('/admin/weatherUserList');
            })
    }
    /**
     * 新增速记
     */
    @route({
        method: "post"
    })
    static quicknote(req: Request, res: Response): Promise.Thenable<void> {
        var quicknote = new QuickNote({
            content: req.body.content,
            state: true,//可用/停用
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
        });
        return quicknote.save()
            .then(data => {
                res.redirect('/admin/quickNoteList');
            })
    }
    /**
     * 修改速记页面
     */
    @route({
        method: "get",
        path: ":id"
    })
    static editQuickNote(req: Request, res: Response): Promise.Thenable<any> {
        return QuickNote.findById(req.params.id).then(note => {
            return { note, success: 1 }
        })
    }
    /**
     * 修改速记
     */
    @route({
        method: "post",
        path: ":id"
    })
    static updateQuickNote(req: Request, res: Response): Promise.Thenable<any> {
        return QuickNote.findByIdAndUpdate(req.params.id, {
            $set: {
                content: req.body.content,
                updateDate: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }).then(() => {
            res.redirect('/admin/quickNoteList');
        })
    }
    /*
     *删除note
     */
    @route({
        path: ":id"
    })
    static deleteNote(req: Request, res: Response): void {
        QuickNote.remove({ _id: req.params.id }, function (err) {
            res.redirect('/admin/quickNoteList');
        });
    }
    /*
     * 速记列表
     */
    @route({})
    static quickNoteList(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session.user;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        return QuickNote.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
            .then(docs => {
                docs.forEach(function (item, index) {
                    if (item.content) {
                        item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                    };
                });
                return { noteList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length };
            })
    }

    /**
     * 关于我配置
     */
    @route({})
    static aboutConfig(req: Request, res: Response): Promise.Thenable<any> {
        let arr: { key: string; value: Object }[] = [];
        return Promise.resolve(About.findOne())
            .then(resume => {
                if (!resume) {
                    var r = new About({
                        nickname: "待修改",
                        job: "待修改",
                        addr: "待修改",
                        tel: "待修改",
                        email: "待修改",
                        resume: "待修改",
                        other: "待修改"
                    })
                    return r.save();
                } else {
                    return resume;
                }
            }).then(resume => {
                return { resume: resume.toObject() }
            })
    }
    /**
     * 修改关于我配置
     */
    @route({
        method: "post",
        json: true
    })
    static updateAboutConfig(req: Request, res: Response): Promise.Thenable<any> {
        var args = req.body;
        debug(args);

        return About.findOneAndUpdate(null, args)
            .then(() => {
                return { success: 1 }
            })
    };

    //简历
    @route({})
    static resume(req: Request, res: Response): Promise.Thenable<any> {
        return ResumeModel.findOne()
            .then(resume => {
                if (resume) {
                    return resume;
                } else {
                    return ResumeModel.create({
                        state: 0
                    });
                }
            }).then(resume => {
                return { resume }
            })
    };
    //简历
    @route({
        method: "post",
        json: true
    })
    static resumeSwitch(req: Request, res: Response): Promise.Thenable<any> {
        var state = req.body.state;
        var id = req.body.id;
        return ResumeModel.findByIdAndUpdate(id, {
            $set: { state: state }
        })
    };
    /**
     * 友链
     */
    @route({})
    static friendLinkList(req: Request, res: Response): Promise.Thenable<any> {
        return FriendLinkModel.find().exec()
            .then(data => {
                return { success: 0, friendLinks: data }
            })
    }
    /**
     * 添加友链
     */
    @route({
        method: "post",
        json: true
    })
    static addFriendLink(req: Request, res: Response): Promise.Thenable<any> {
        return FriendLinkModel.create({
            url: req.body.url,
            name: req.body.name
        }).then(data => {
            res.redirect('/admin/friendLinkList');
        })
    }
    /**
     * 删除友链
     */
    @route({
        method: "get",
        path: ":id"
    })
    static delFriendLink(req: Request, res: Response): void {
        FriendLinkModel.remove({
            _id: req.params.id
        }).then(data => {
            res.redirect('/admin/friendLinkList');
        })
    }

    //临时使用
    @route({ json: true })
    static updateTime(req: Request, res: Response): Promise.Thenable<any> {
        return Blog.find().then(blogs => {
            return Promise.each(blogs, (item, index) => {
                // item.createdAt = moment(item.createdAt).toDate()
                let time = new Date(item.createdAt)
                item.set("createdAt", time)
                console.log(">>>>>>>>>", time);
                item.set("updatedAt", time)
                return item.save()
            })
        })
    };
}











