import {Document, model, Model, Schema} from 'mongoose';

export var CommentSchema: Schema = new Schema({
    bldgId: String,//博客id
    content: String, //内容
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true});
// 设置timestamps选项会自动创建createdAt和updatedAt两个属性
export interface IComment extends Document {
    blogId: string;
    content: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}
var CommentModel: Model<IComment> = model<IComment>('Comment', CommentSchema);

export default CommentModel;