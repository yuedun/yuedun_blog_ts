import { Document, model, Model, Schema } from 'mongoose';

export var Mychema: Schema = new Schema({
	content: String,//留言内容
	ip: String,
	replyid: String,//留言博客id
	status: {
		type: Number,
		default: 1,
	},//留言状态
	nickname: String,//昵称
	email: String,
	website: String,
	createdAt: Date,
	updatedAt: Date,
}, { timestamps: true });
// 设置timestamps选项会自动创建createdAt和updatedAt两个属性
export interface IMessage extends Document {
	content: string,
	ip: string,
	replyid: string,
	replyTitle?: string,
	status: number,
	nickname: string,
	email: string,
	website: string,
	createdAt: Date;
	createdDate: string;
	updatedAt: Date;
}
var CommentModel: Model<IMessage> = model<IMessage>('Message', Mychema);

export default CommentModel;