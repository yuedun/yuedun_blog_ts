import { Document, model, Model, Schema } from 'mongoose';

var ResumeSchema: Schema = new Schema({
	state: Number,
}, { timestamps: true });

export interface IResume extends Document {
	state: number;
	createdAt: Date;
	updatedAt: Date;
}
var ResumeModel: Model<IResume> = model<IResume>('Curriculum', ResumeSchema);

export default ResumeModel;