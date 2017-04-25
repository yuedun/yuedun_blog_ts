import {Document, model, Model, Schema} from 'mongoose';

export var CategorySchema: Schema = new Schema({
    cateName:String,
    state:Boolean,//是否可用
    createDate:String
});

export interface ICategory extends Document {
    cateName:String,
    state:Boolean,//是否可用
    createDate:String
}
var CategoryModel: Model<ICategory> = model<ICategory>('Category', CategorySchema);

export default CategoryModel;