import {Document, model, Model, Schema} from 'mongoose';

var WeatherLogSchema: Schema = new Schema({
  mobiles: String,//用户
  weather: String,//天气内容
  createAt: String,//创建时间
});

var WeatherLogSchema: Schema = new Schema({
  mobiles: String,
  weather: String,
  createAt: String
});

interface IWeatherLog extends Document {
  mobiles: string;
  weather: string;
  createAt: string;
}
var WeatherLogModel: Model<IWeatherLog> = model<IWeatherLog>('WeatherLog', WeatherLogSchema);

export default WeatherLogModel;