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
            var r = {
                regID: reg_id,
                regCode: 1
            };
            if (err) {
                console.error(err);
                r.regCode = 0;
                callback(r);
            } else {
                r.regCode = 1;
                callback(r);
            }
        });
    },

    removeByRegId: function (reg_id, callback) {

        User.findOneAndRemove({
            regID: reg_id
        }, function (err, product) {
            if (err) throw err;
            console.log('User Deleted: ' + product._id);
            callback();
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
            for (var i = 0; i < cb.length; i++) {
                regIDs.push(cb[i].regID);
            }
            if (i == cb.length)
                callback(regIDs);
        });

    }

};
