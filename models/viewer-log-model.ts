/**
 * 访问统计
 */
import {Document, model, Model, Schema} from 'mongoose';

var ViewerLogSchema: Schema = new Schema({
    ip: String,
    url: String,//访问地址
    referer: String,//跳转来源页面
    userAgent: String,//浏览器信息
    createdAt: String,//创建时间
});

interface IViewerLog extends Document {
    ip: string,
    url: string,//访问地址
    referer: string,//跳转来源页面
    userAgent: string,//浏览器信息
    createdAt: string,//创建时间
}
var ViewerLogModel: Model<IViewerLog> = model<IViewerLog>('ViewerLog', ViewerLogSchema);

export default ViewerLogModel;