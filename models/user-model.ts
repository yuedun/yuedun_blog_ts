import { Document, model, Model, Schema } from 'mongoose';

var UserSchema: Schema = new Schema({
  username: String,
  password: String,
  nickname: String,
  level: Number,//权限等级
  state: Boolean,//用户是否可用
}, { timestamps: true });

export interface IUser extends Document {
  username: string,
  password: string,
  nickname: string,
  level: number,//权限等级
  state: boolean,//用户是否可用
  createdAt: Date;
  updatedAt: Date;
}
var UserModel: Model<IUser> = model<IUser>('User', UserSchema);

export default UserModel;