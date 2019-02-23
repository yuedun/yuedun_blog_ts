/**
 * Created by huopanpan on 2014/6/30.
 */
/**
 *  连接到mongodb
 *  使用mongoose而非mongodb中间件
 **/
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
(<any>mongoose).Promise = Promise;//使用bluebird代替mongoose自身的promise
import * as settings from '../settings';
const mongodbConfig = settings.mongodb;

export default class MongoConnection {
    private host = mongodbConfig.host;
    private port = mongodbConfig.port;
    private username = mongodbConfig.uid;
    private password = mongodbConfig.pwd;
    private dbName = mongodbConfig.db;
    private url = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}`;
    public mongoose = mongoose;
    constructor() {
        if (process.env.NODE_ENV == "development") {
            mongoose.set("debug", true);
        }
        const opts = {
            // autoReconnect: false,//默认true
            // reconnectTries: 30,//尝试重连，默认30次
            // reconnectInterval: 1000, //重连间隔，默认1000毫秒
            loggerLevel: "warn", //error/warn/info/debug
            useMongoClient: true
        };
        mongoose.connect(this.url, opts, function (err) {
            if (err) {
                console.log('connection callback error');
            }           
        });//一个数据库用connect,多个用createConnection
    }
}