var gcm = require('node-gcm');
var users = require('./users');
var index = require('../index');

// for client var newSenderID = '598467768233';
var new_api_key = 'AIzaSyAoqQfuGRhod_KlzuERxebTaeqkFSIqDE0';
var api_key = 'AIzaSyDNxQH5e9jt1X6dqbJS0mN4RrIJwR-eIFg';

var sender = new gcm.Sender(new_api_key);

var self = module.exports = {

    types: {
        NEW: 0,
        UPDATE: 1,
        DELETE: 2,
        RESET: 3,
        TEST: 4
    },

    createMessage: function (type, title, message) {
        return new gcm.Message({
            collapseKey: 'bilmuh ' + type,
            delayWhileIdle: true,
            data: {
                type: type,
                title: title,
                message: message
            }
        });
    },

    sendMessage: function (regID, message, callback) {

        var regIds = [];
        regIds.push(regId);

        sender.send(message, regIds, 4, function (err, result) {
            if (err) return console.error(err);
            callback(result);
        });

    },

    sendMessageToAll: function (message, callback) {

        if (index.ip === '127.0.0.1') {
            callback();
            return;
        }

        users.getAllRegIds(function (regIDs) {

            sender.send(message, regIDs, 4, function (err, result) {
                if (err) {
                    return console.error(err);
                }
                callback(result);
            });

        });
    },

    sendDryMsgToAll: function (callback) {

        var message = self.createMessage("dryrun", "test", "test");

        users.getAllRegIds(function (regIDs) {

            sender.send(message, regIDs, 4, function (err, result) {
                if (err) {
                    return console.error(err);
                }
                callback(result, regIDs);
            });

        });
    }

};

/*
                var message = new gcm.Message({
                    collapseKey: 'bilmuh',
                    delayWhileIdle: true,
                    //timeToLive: 500,
                    data: {
                        type: type,
                        title: 'Bilmuh Duyuru',
                        message: mess
                    }
                });
*/