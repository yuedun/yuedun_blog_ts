"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Promise = require("bluebird");
mongoose.Promise = Promise;
var settings = require("../settings");
var mongodbConfig = settings.mongodb;
var MongoConnection = (function () {
    function MongoConnection() {
        this.host = mongodbConfig.host;
        this.port = mongodbConfig.port;
        this.username = mongodbConfig.uid;
        this.password = mongodbConfig.pwd;
        this.dbName = mongodbConfig.db;
        this.url = "mongodb://" + this.username + ":" + this.password + "@" + this.host + ":" + this.port + "/" + this.dbName;
        this.mongoose = mongoose;
        if (process.env.NODE_ENV == "development") {
            mongoose.set("debug", true);
        }
        var opts = {
            loggerLevel: "warn",
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        mongoose.connect(this.url, opts, function (err) {
            if (err) {
                console.log('connection callback error', err);
            }
        });
    }
    return MongoConnection;
}());
exports.default = MongoConnection;
//# sourceMappingURL=connection.js.map