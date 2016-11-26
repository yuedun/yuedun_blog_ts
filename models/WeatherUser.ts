var mongoose = require('mongoose');

export default mongoose.model('WeatherUser', {
    username: String,//用户名
    mobile: String,//手机
    city: String,//城市
    cityCode:Number,//城市编码
    createAt: String,//创建时间
    sendCount: Number, //发送次数
    status: Number,//是否可用，1可用，0禁用

});