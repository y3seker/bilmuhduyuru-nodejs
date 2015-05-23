var gcm = require('node-gcm');
var users = require('./users');

var myApiKey = 'AIzaSyDNxQH5e9jt1X6dqbJS0mN4RrIJwR-eIFg';
var sender = new gcm.Sender(myApiKey);

module.exports = {

    sendMessage: function (regId, mess, callback) {

        var message = new gcm.Message({
            collapseKey: 'message',
            delayWhileIdle: true,
            timeToLive: 500,
            data: {
                title: "bilmuh",
                message: mess
            }
        });
        var regIds = [];
        regIds.push(regId);

        sender.send(message, regIds, 4, function (err, result) {
            if (err) return console.error(err);
            callback(result);
        });

    },

    sendMessageToAll: function (mess, callback) {

        if (index.ip === '127.0.0.1')
            callback();

        var message = new gcm.Message({
            collapseKey: 'bilmuh',
            delayWhileIdle: true,
            //timeToLive: 500,
            data: {
                title: 'Bilmuh Duyuru',
                message: mess
            }
        });

        users.getAllRegIDs(function (regIDs) {

            sender.send(message, regIDs, 4, function (err, result) {
                if (err) {
                    return console.error(err);
                }
                callback(result);
            });

        });
    },

    sendDryMsgToAll: function (mess, callback) {

        var message = new gcm.Message({
            collapseKey: 'bilmuh',
            delayWhileIdle: true,
            dryRun: true,
            data: {
                title: 'Bilmuh Duyuru',
                message: mess
            }
        });
        users.getAllRegIDs(function (regIDs) {

            sender.send(message, regIDs, 4, function (err, result) {
                if (err) {
                    return console.error(err);
                }
                callback(result, regIDs);
            });

        });
    }

};