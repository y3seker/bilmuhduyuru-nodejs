var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_CONNECTION);

var c = mongoose.connection;

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

module.exports = {

    open: function (cb) {

        c.once('open', function callback() {
            console.log("DB has opened.");
            cb();
        });
    },

    close: function (cb) {

        c.once('close', function callback() {
            console.log("DB has closed.");
            cb();
        });
    }

};
