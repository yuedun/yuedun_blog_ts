import { Document, model, Model, Schema } from 'mongoose';

var IAboutSchema: Schema = new Schema({
  nickname: String,
  job: String,
  addr: String,
  tel: String,
  email: String,
  resume: String,
  other: String,
});

export interface IAbout extends Document {
  nickname: string,
  job: string,
  addr: string,
  tel: string,
  email: string,
  resume: string,
  other: string
}
var IAboutModel: Model<IAbout> = model<IAbout>('Resume', IAboutSchema);

export default IAboutModel;
