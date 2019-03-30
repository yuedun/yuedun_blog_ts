import { Document, model, Model, Schema } from 'mongoose';

export var WeatherUserSchema: Schema = new Schema({
    username: String,//用户名
    mobile: String,//手机
    city: String,//城市
    cityCode: Number,//城市编码
    createAt: Date,//创建时间
    sendCount: Number, //发送次数
    status: Number,//是否可用，1可用，0禁用
});

export interface IWeatherUser extends Document {
    username: string,//用户名
    mobile: string,//手机
    city: string,//城市
    cityCode: number,//城市编码
    createAt: Date,//创建时间
    sendCount: number, //发送次数
    status: number,//是否可用，1可用，0禁用
}
var WeatherUserModel: Model<IWeatherUser> = model<IWeatherUser>('WeatherUser', WeatherUserSchema);

export default WeatherUserModel;