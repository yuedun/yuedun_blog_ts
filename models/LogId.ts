import { Document, model, Model, Schema } from 'mongoose';

var LogIdSchema: Schema = new Schema({
  updateAt:Date,//更新时间,id会自动建立
  lastLogId:Number//最后一条id
});

export interface ILogId extends Document {
  username: string,
  password: string,
  nickname: string,
  level: number,//权限等级
  state: boolean,//用户是否可用
  createDate: string
}
var LogIdModel: Model<ILogId> = model<ILogId>('LogId', LogIdSchema);

export default LogIdModel;