import { Document, model, Model, Schema } from 'mongoose';

export var Mychema: Schema = new Schema({
	sourceid: String,
	title: String,
	url: String,
	ttime: Number,
	metadata: String,
	comments: [{
		apptype: Number,
		attachment: Array,
		channelid: Number,
		channeltype: Number,
		cmtid: String,
		content: String,
		ctime: Number,
		from: Number,
		ip: String,
		opcount: Number,
		referid: String,
		replyid: String,
		score: Number,
		spcount: Number,
		status: Number,
		user: {
			nickname: String,
			sohuPlusId: Number,
			usericon: String
		},
		useragent: String
	}]
}, { timestamps: true });
// 设置timestamps选项会自动创建createdAt和updatedAt两个属性
export interface IComment extends Document {
	content: string,
	ip: string,
	referid: string,
	replyid: string,
	status: number,
	nickname: string,
	usericon: string
	useragent: string
	createdAt: Date;
	updatedAt: Date;
}
var CommentModel: Model<IComment> = model<IComment>('Message', Mychema);

export default CommentModel;