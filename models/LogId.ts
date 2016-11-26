/**
 * Created by huopanpan on 2014/7/2.
 * 博客
 * mongodb是无模式的，可以不提前定义数据字段，在实际使用过程中如有需要再进行添加
 * 比如需要添加用户对象，
 * var User = mongoose.model('User');
 * var user = new User();
 * user.name = 'zhangsan';
 * user.age = 35;
 * 或者var user = new User({name:"zhangsan",age:35});
 * user.save();
 */
var mongoose = require('mongoose');

export default mongoose.model('LogId',{
    updateAt:Date,//更新时间,id会自动建立
    lastLogId:Number//最后一条id
});