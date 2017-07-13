import { Document, model, Model, Schema } from 'mongoose';

var ResumeSchema: Schema = new Schema({
  nickname: String,
  job: String,
  addr: String,
  tel: String,
  email: String,
  resume: String,
  other: String,
});

export interface IResume extends Document {
  nickname: string,
  job: string,
  addr: string,
  tel: string,
  email: string,
  resume: string,
  other: string
}
var ResumeModel: Model<IResume> = model<IResume>('Resume', ResumeSchema);

export default ResumeModel;
