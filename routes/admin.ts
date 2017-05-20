import * as _ from 'lodash';
import { Request, Response } from 'express';
import * as Moment from 'moment';//日期格式化组件
import * as Promise from 'bluebird';
import { default as User } from '../models/user-model';
import { default as Blog, IBlog as BlogInstance } from '../models/blog-model';
import { default as QuickNote } from '../models/quick-note-model';
import { default as Category, ICategory as CategoryInstance } from '../models/category-model';
import { default as WeatherUser } from '../models/weather-user-model';
import * as qiniu from '../utils/qiniu';
import * as Markdown from 'markdown-it';
var md = Markdown();
var area = require('../area');
import { default as PvModel } from '../models/viewer-log-model';
import { route } from '../utils/route';

export default class Routes {
    /**
     * success0未修改，1成功
     * 
    **/

    /*进入后台主界面 */
    @route({

    })
    static index(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session ? req.session.user : {};
        if (user != null) {
            return Promise.resolve({ title: '后台管理首页', user: user });
        } else {
            return Promise.resolve({ title: '用户登录' });
        }
    }

    /* 后台登陆 */
    @route({

    })
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
            password: object.password
        }
        return User.findOne(user)
            .then(obj => {
                if (obj || process.env.NODE_ENV === 'development') {
                    req.session.user = user;
                    if (object.remeber) {
                        res.cookie('autologin', 1, {
                            expires: new Date(Date.now() + 864000000)//10天
                        });
                    }
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
    @route({

    })
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
    @route({

    })
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
            createDate: Moment().format('YYYY-MM-DD HH:mm:ss'),//发表时间
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
                        state: true,
                        createDate: Moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    return category.save();
                } else {
                    return category;
                }
            }).then(category => {
                return blog.save();
            }).then(() => {
                return { success: 1 };
            })
    }
    /**
     *文章列表
     */
    @route({

    })
    static blogList(req: Request, res: Response): Promise.Thenable<any> {
        var user = req.session ? req.session.user : null;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        return Blog.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize })
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
                return { success: success, blogList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length };
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
        return Blog.findByIdAndUpdate(req.params.id, {
            $set: {
                title: args.title,
                content: args.content,
                category: args.category,
                tags: args.tags,
                status: parseInt(args.status),
                updateTime: Moment().format('YYYY-MM-DD HH:mm:ss')
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
    @route({

    })
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
        var category = new Category();
        category.cateName = req.body.cateName;
        category.state = true;
        category.createDate = Moment().format('YYYY-MM-DD HH:mm:ss');
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
    @route({

    })
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
            password: password,
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
    @route({

    })
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
    @route({

    })
    static logout(req: Request, res: Response): void {
        req.session.user = null;
        res.clearCookie("autologin");
        res.redirect('/admin/login');
        return;
    }

    //添加天气用户界面
    @route({

    })
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
        .then(data=>{
            res.redirect('/admin/weatherUserList');
        })
    }
    /**
     * 查看天气用户列表
     */
    @route({

    })
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
    static delWeatherUser(req: Request, res: Response): void {
        return Promise.resolve(WeatherUser.remove({ _id: req.params.userId }))
            .then(d => {
                res.redirect('/admin/weatherUserList');
            }).value()
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
     * 修改速记
     */
    @route({
        method: "post",
        path: ":id"
    })
    static updateQuickNote(req: Request, res: Response): Promise.Thenable<any> {
        return QuickNote.findByIdAndUpdate(req.params.id, {
            $set:
            {
                content: req.body.content,
                updateDate: Moment().format('YYYY-MM-DD HH:mm:ss')
            }
        }).then(() => {
            return { success: 1 }
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
    @route({

    })
    static quickNoteList(req: Request, res: Response): void {
        var user = req.session.user;
        var success = req.query.success || 0;
        var pageIndex = 1;
        var pageSize = 10;
        pageIndex = req.query.pageIndex ? req.query.pageIndex : pageIndex;
        pageSize = req.query.pageSize ? req.query.pageSize : pageSize;
        QuickNote.find({}, null, { sort: { '_id': -1 }, skip: (pageIndex - 1) * pageSize, limit: ~~pageSize }, function (err, docs) {
            if (err) {
                res.send(err.message);
                return;
            }
            docs.forEach(function (item, index) {
                if (item.content) {
                    item.content = item.content.replace(/<\/?.+?>/g, "").substring(0, 300);
                };
            });
            res.render('admin/quicknote', { success: success, noteList: docs, user: user, pageIndex: pageIndex, pageCount: docs.length });
        });
    }

    /**
     * 访问统计
     */
    @route({

    })
    static readCount(req: Request, res: Response): Promise.Thenable<any> {
        var today = Moment().format('YYYY-MM-DD');
        return Promise.all<any, number>([
            Blog.aggregate({ $group: { _id: null, pvCount: { $sum: '$pv' } } }),
            PvModel.count({ createdAt: { $regex: today, $options: 'i' } })//模糊查询"%text%"
        ]).then(([result1, result2]) => {
            return { readCount: result1[0].pvCount, todayRead: result2 }
        })
    }
}











