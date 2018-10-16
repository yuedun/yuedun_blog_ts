import { Document, model, Model, Schema } from 'mongoose';

var FriendLinkSchema: Schema = new Schema({
	url: { type: String, required: true },
	name: { type: String, required: true },
	state: { type: Number, required: true, default: 1 }
}, { validateBeforeSave: true, timestamps: true });

export interface IFriendLink extends Document {
	url: string,
	name: string,
	state: {
		type: number,
		default: 1,//1可用，0暂停
	},//用户是否可用
	createdAt: Date,//发表时间
    updatedAt: Date,//修改时间
}
var FriendLinkModel: Model<IFriendLink> = model<IFriendLink>('FriendLink', FriendLinkSchema);

export default FriendLinkModel;