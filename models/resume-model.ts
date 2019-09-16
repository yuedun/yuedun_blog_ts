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

var ResumeModel: Model<IResume> = model<IResume>('Resume', ResumeSchema);

export default ResumeModel;