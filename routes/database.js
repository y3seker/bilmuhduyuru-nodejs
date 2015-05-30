var mongoose = require('mongoose');
var oldDB = 'mongodb://db-user0:00123654@ds035250.mongolab.com:35250/gcm-nodejs'
var newDB = 'mongodb://bilmuh_user:00123654@ds041432.mongolab.com:41432/bilmuh'

mongoose.connect(newDB);

var c = mongoose.connection;

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = {

    open: function (cb) {

        c.once('open', function callback() {
            console.log("DB is opened.");
            cb();
        });
    },

    close: function (cb) {

        c.once('close', function callback() {
            console.log("DB is closed.");
            cb();
        });
    }

};