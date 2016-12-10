/**
 * Created by huopanpan on 2014/6/30.
 */
/**
 *  连接到mongodb
 *  使用mongoose而非mongodb中间件
 **/
var mongoose = require('mongoose');
import * as settings from '../settings';
var mongodbConfig = settings.mongodb;

var host = mongodbConfig.host,
    port = mongodbConfig.port,
    username = mongodbConfig.uid,
    password = mongodbConfig.pwd,
    dbName = mongodbConfig.db,
    url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;

var count = 0;
var dbcon = null;
export function getConnect() {
    var opts = {
        db: {
            native_parser: true
        },
        server: {
            poolSize : 5,//默认为5
            auto_reconnect: true
        },
        user: username,
        pass: password
    };
    (function connect(){
        mongoose.connect(url,opts);//一个数据库用connect,多个用createConnection
        dbcon = mongoose.connection;//获取Connection 连接对象
        dbcon.on('error', function(error) {
            console.log('connection error');
            // dbcon.readyState = "disconnected";
            reConnect();
        });
    })();//定义完自执行
    //connected
    function reConnect(){
        console.log(">>>>>>>>>reconnect")
        getConnect();
    }
}
 export {mongoose}