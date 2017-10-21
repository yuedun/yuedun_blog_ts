import { Document, model, Model, Schema } from 'mongoose';
import * as moment from 'moment';

export var CategorySchema: Schema = new Schema({
    cateName: { type: String, required: true },
    state: { type: Boolean, default: true }//是否可用
}, { timestamps: true });

CategorySchema.virtual('newdate').get(function () {
    return moment(this.createdAt).format('YYYY-M-DD HH:mm:ss');
});

export interface ICategory extends Document {
    cateName: string,
    state: boolean,//是否可用
    createdAt: Date,
    updatedAt: Date,
    newdate: string,
}
var CategoryModel: Model<ICategory> = model<ICategory>('Category', CategorySchema);

export default CategoryModel;