import {Document, model, Model, Schema} from 'mongoose';

export var BlogSchema: Schema = new Schema({
    title: String,//标题
    createDate: String,//发表时间
    updateTime: String,//修改时间
    content: String, //内容
    status: {
        type: Number,
        default: 1
    },//发布，草稿，
    comments: [],//评论
    commentCount: {
        type: Number,
        default: 0
    },//评论数
    category: {
        type: String,
        default: ''
    },//分类
    top: Number,//置顶
    tags: String,//标签
    pv: Number,//访问量,
    ismd: Number//是否markdown编写0否，1是
});

export interface IBlog extends Document {
    // id在document中存在
    title: string,//标题
    createDate: string,//发表时间
    updateTime: string,//修改时间
    content: string, //内容
    status: string,//发布，草稿，
    comments: string[],//评论
    commentCount: number,//评论数
    category: string,//分类
    top: number,//置顶
    tags: string,//标签
    pv: number,//访问量,
    ismd: number//是否markdown编写0否，1是
}
var BlogModel: Model<IBlog> = model<IBlog>('Blog', BlogSchema);

export default BlogModel;