import {Document, model, Model, Schema} from 'mongoose';

var QuickNoteSchema: Schema = new Schema({
    createDate:String,//发表时间
    content:String, //内容
    status:String,//发布，草稿
});

interface IQuickNote extends Document {
    createDate:string,//发表时间
    content:string, //内容
    status:string,//发布，草稿
}
var QuickNoteModel: Model<IQuickNote> = model<IQuickNote>('QuickNote', QuickNoteSchema);

export default QuickNoteModel;