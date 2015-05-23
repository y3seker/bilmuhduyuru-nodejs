var mongoose = require('mongoose');
var db_url = 'mongodb://db-user0:00123654@ds035250.mongolab.com:35250/gcm-nodejs'

mongoose.connect(db_url);

//var db = mongoose.connection;

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = {

    open: function (cb) {

        mongoose.connection.once('open', function callback() {
            console.log("DB is opened.");
            cb();
        });
    },

    close: function (cb) {

        mongoose.connection.once('close', function callback() {
            console.log("DB is closed.");
            cb();
        });
    }

};