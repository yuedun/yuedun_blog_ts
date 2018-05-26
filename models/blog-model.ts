import { Document, model, Model, Schema } from 'mongoose';
import * as moment from 'moment';

export var BlogSchema: Schema = new Schema({
    title: { type: String, required: true },//标题
    content: { type: String, required: true }, //内容
    status: {
        type: Number,
        default: 1
    },//1发布，0草稿
    comments: [],//评论
    category: String,//分类
    top: Number,//置顶
    tags: String,//标签
    pv: Number,//访问量,
    ismd: Number//是否markdown编写0否，1是
}, { validateBeforeSave: true, timestamps: true });

BlogSchema.virtual('createDate').get(function () {
    return moment(this.createdAt).format('YYYY-M-DD HH:mm:ss');
});
BlogSchema.virtual('updateTime').get(function () {
    return moment(this.udpatedAt).format('YYYY-M-DD HH:mm:ss');
});

export interface IBlog extends Document {
    // _id在Document中存在
    title: string,//标题
    createdAt: Date,//发表时间
    updatedAt: Date,//修改时间
    content: string, //内容
    status: number,//发布，草稿，
    comments: string[],//评论
    category: string,//分类
    top: number,//置顶
    tags: string,//标签
    pv: number,//访问量,
    ismd: number,//是否markdown编写0否，1是
    createDate: string,
}
var BlogModel: Model<IBlog> = model<IBlog>('Blog', BlogSchema);

export default BlogModel;