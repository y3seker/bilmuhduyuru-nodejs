var user = require('./users');

var spamList = [];


module.exports = {

    registerKey: 'g@bed7cHe=aTUza',

    isEmpty: function (obj) {
        return Object.keys(obj).length == 0;
    },

    addTempSpammer: function (username, timeout) {
        spamList.push(username);
        setTimeout(function () {
            var x = spamList.indexOf(username);
            spamList.splice(x, 1);
        }, timeout);
    },

    isInSpamList: function (username) {

        if (spamList.length === 0)
            return false;

        if (spamList.indexOf(username) != -1) {
            return true;
        } else {
            return false;
        }

    },

    minutesToMillis: function (minutes) {
        return minutes * 60 * 1000;
    },

    deleteUnreachableUsers: function (result, users) {
        for (var a in result.results) {
            if (result.results[a].error != undefined) {
                user.removeByRegId(users[a], function (cb) {

                });
            }
        }
    }

};