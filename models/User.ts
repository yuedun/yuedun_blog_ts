import {Document, model, Model, Schema} from 'mongoose';

var UserSchema: Schema = new Schema({
  mobiles: String,//用户
  weather: String,//天气内容
  createAt: String,//创建时间
});

var UserSchema: Schema = new Schema({
  mobiles: String,
  weather: String,
  createAt: String
});

interface IUser extends Document {
  mobiles: string;
  weather: string;
  createAt: string;
}
var UserModel: Model<IUser> = model<IUser>('User', UserSchema);

export default UserModel;