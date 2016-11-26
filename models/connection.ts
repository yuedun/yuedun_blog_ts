/**
 * Created by huopanpan on 2014/6/30.
 */
/**
 *  连接到mongodb
 *  使用mongoose而非mongodb中间件
 **/
var mongoose = require('mongoose');
var settings = require('../settings').mongodb;

var host = settings.host,
    port = settings.port,
    username = settings.uid,
    password = settings.pwd,
    dbName = settings.db,
    url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;

var count = 0;
var dbcon = null;
function getConnect() {
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
        //监听关闭事件并重连
        // dbcon.on('disconnected', function() {
        //     console.log('disconnected');
        //     reConnect();
        // });
        // dbcon.on('close', function(err) {
        //     dbcon.readyState = "disconnected";
        //     reConnect();
        //     console.log('close-event-to-connect');
        // });
    })();//定义完自执行
    //connected
    function reConnect(){
        // dbcon.open(host, dbName, port, opts, function() {
        //     console.log('closed-reconnect'); 
        // });
        console.log(">>>>>>>>>reconnect")
        getConnect();
    }
}

exports.getConnect = getConnect;//包含到module.exports对象中,
// 如果module.exports中包含属性或方法则export.XX将被忽略
// Module.exports才是真正的接口，exports只不过是它的一个辅助工具。
// 最终返回给调用的是Module.exports而不是exports。
// 所有的exports收集到的属性和方法，都赋值给了Module.exports。
// 当然，这有个前提，就是Module.exports本身不具备任何属性和方法。
// 如果，Module.exports已经具备一些属性和方法，那么exports收集来的信息将被忽略。
//module.exports = getConnection;//直接导出这个对象
exports.mongoose = mongoose;