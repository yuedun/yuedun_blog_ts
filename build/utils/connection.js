"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Promise = require("bluebird");
mongoose.Promise = Promise;
var settings_1 = require("../settings");
var MongoConnection = (function () {
    function MongoConnection() {
        this.host = settings_1.mongodb.host;
        this.port = settings_1.mongodb.port;
        this.username = settings_1.mongodb.uid;
        this.password = settings_1.mongodb.pwd;
        this.dbName = settings_1.mongodb.db;
        this.url = settings_1.mongodb.murl;
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