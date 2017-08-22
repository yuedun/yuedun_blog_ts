import { Document, model, Model, Schema } from 'mongoose';

export var CategorySchema: Schema = new Schema({
    cateName: { type: String, required: true },
    state: { type: Boolean, default: true }//是否可用
}, { timestamps: true });

export interface ICategory extends Document {
    cateName: string,
    state: boolean,//是否可用
    createdAt: Date,
    updatedAt: Date
}
var CategoryModel: Model<ICategory> = model<ICategory>('Category', CategorySchema);

export default CategoryModel;