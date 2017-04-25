"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require('mongoose');
exports.mongoose = mongoose;
var settings = require("../settings");
var mongodbConfig = settings.mongodb;
var host = mongodbConfig.host, port = mongodbConfig.port, username = mongodbConfig.uid, password = mongodbConfig.pwd, dbName = mongodbConfig.db, url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;
var count = 0;
var dbcon = null;
function getConnect() {
    var opts = {
        db: {
            native_parser: true
        },
        server: {
            poolSize: 5,
            auto_reconnect: true
        },
        user: username,
        pass: password
    };
    (function connect() {
        mongoose.connect(url, opts);
        dbcon = mongoose.connection;
        dbcon.on('error', function (error) {
            console.log('connection error');
            reConnect();
        });
    })();
    function reConnect() {
        console.log(">>>>>>>>>reconnect");
        getConnect();
    }
}
exports.getConnect = getConnect;
//# sourceMappingURL=connection.js.map