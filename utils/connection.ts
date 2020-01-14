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
import { mongodb } from '../settings';

export default class MongoConnection {
    private host = mongodb.host;
    private port = mongodb.port;
    private username = mongodb.uid;
    private password = mongodb.pwd;
    private dbName = mongodb.db;
    private url = mongodb.murl;//`mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}`;
    // private url = `mongodb://${this.username}:${this.password}@${this.host}:${this.port}/${this.dbName}`;
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
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        mongoose.connect(this.url, opts, function (err) {
            if (err) {
                console.log('connection callback error', err);
            }
        });//一个数据库用connect,多个用createConnection
    }
}