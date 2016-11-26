var mongoose = require('mongoose');
var settings = require('../settings').mongodb;
var host = settings.host, port = settings.port, username = settings.uid, password = settings.pwd, dbName = settings.db, url = "mongodb://" + username + ":" + password + "@" + host + ":" + port + "/" + dbName;
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
exports.mongoose = mongoose;
//# sourceMappingURL=connection.js.map