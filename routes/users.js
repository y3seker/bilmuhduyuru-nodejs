var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    regID: String
});

var User = mongoose.model('User', userSchema);

var self = module.exports = {

    save: function (regID, callback) {

        var user = new User({
            regID: regID
        });

        user.save(function (err, product) {
            if (err) throw err;
            callback(200);
        });
    },

    add: function (reg_id, callback) {

        var update = {
            regID: reg_id
        };

        var options = {
            upsert: true
        };

        User.findOneAndUpdate(update, update, options, function (err, doc) {
            if (err) {
                update.regCode = 0;
                callback(update);
            } else {
                update.regCode = 1;
                callback(update);
            }
        });
    },

    removeByRegId: function (reg_id, callback) {

        User.findOneAndRemove({
            regID: reg_id
        }, function (err, product) {
            if (err) {
                callback({
                    response: 'Invalid'
                });
                return console.error(err);
            } else {
                console.log('Removed: ' + product._id);
                callback({
                    response: 'Removed'
                });
            }

        });
    },

    getAll: function (callback) {
        User.find({}, function (err, docs) {
            if (err) throw err;
            callback(docs);
        });
    },

    getAllRegIds: function (callback) {
        var regIDs = [];
        self.getAll(function (cb) {
            console.log('Getting All Users, length: ' + cb.length);
            for (var i = 0; i < cb.length; i++) {
                regIDs.push(cb[i].regID);
            }
            if (i == cb.length)
                callback(regIDs);
        });

    }

};