var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    regID: String
});

var User = mongoose.model('User', userSchema);

var saveU = function (username, regID, callback) {
    var user = new User({
        username: username,
        regID: regID
    });

    user.save(function (err, product) {
        if (!err)
            callback(200);
        else {
            callback(403);
            return console.error(err);
        }
    });
};

var addNewUser = function (uname, reg_id, callback) {

    var update = {
        regID: reg_id
    };
    var query = {
        username: uname
    };
    var options = {
        upsert: true
    };

    User.findOneAndUpdate(query, update, options, function (err, doc) {
        if (err) {
            var cb = {
                username: uname,
                regID: "",
                regCode: 0
            }
            callback(cb);
        } else {
            var cb = {
                username: uname,
                regID: reg_id,
                regCode: 1
            }
            callback(cb);
        }
    });
};

var getUserById = function (u_id, callback) {

    User.findById(u_id, function (err, user) {
        if (err) {
            callback({
                response: user
            });
            return console.error(err);
        }
        callback({
            response: user
        });
    });
};

var removeUserByUsername = function (uname, callback) {

    User.findOneAndRemove({
        username: uname
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
};
var removeUserByRegId = function (regId, callback) {

    User.findOneAndRemove({
        regID: regId
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
};
var getAllUsers = function (callback) {
    User.find({}, function (err, docks) {
        if (err) {
            callback({
                response: 'An error occured.'
            });
            return console.error(err);
        }
        callback({
            response: docks
        });
    });
};

var getAllRegIDs = function (callback) {
    var regIDs = [];
    getAllUsers(function (cb) {

        console.log('Getting All Users, length: ' + cb.response.length);

        for (var i = 0; i < cb.response.length; i++) {
            regIDs.push(cb.response[i].regID);
        }
        if (i == cb.response.length)
            callback(regIDs);
    });

};


module.exports.getAllRegIDs = getAllRegIDs;
module.exports.removeUserByUsername = removeUserByUsername;
module.exports.removeUserByRegId = removeUserByRegId;
module.exports.getAllUsers = getAllUsers;
module.exports.getUserById = getUserById;
module.exports.addNewUser = addNewUser;
module.exports.saveU = saveU;

var isEmpty = function (obj) {
    return Object.keys(obj).length == 0;
};