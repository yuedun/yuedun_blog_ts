import { Document, model, Model, Schema } from 'mongoose';

var ResumeSchema: Schema = new Schema({
	state: Number,
	content: String,
}, { timestamps: true });

export interface IResume extends Document {
	state: number;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}
//resume已被占用，使用Curriculum
var ResumeModel: Model<IResume> = model<IResume>('Curriculum', ResumeSchema);

export default ResumeModel;