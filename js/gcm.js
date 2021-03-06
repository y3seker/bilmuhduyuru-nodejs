var gcm = require('node-gcm');
var users = require('./users');
var app = require('./app');

var sender = new gcm.Sender(process.env.GCM_API_KEY);

var self = module.exports = {

    types: {
        NEW: '0',
        UPDATE: '1',
        DELETE: '2',
        RESET: '3',
        TEST: '4'
    },

    createMessage: function (type, title, message) {
        return new gcm.Message({
            collapseKey: 'bilmuh ' + type,
            delayWhileIdle: true,
            data: {
                type: type,
                type2: type,
                title: title,
                message: message
            }
        });
    },

    sendMessage: function (regID, message, callback) {

        var regIds = [];
        regIds.push(regID);

        sender.send(message, regIds, 4, function (err, result) {
            if (err) return console.error(err);
            callback(result);
        });

    },

    sendMessageToAll: function (message, callback) {

        if (app.env === 'development') {
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

        var message = new gcm.Message({
            collapseKey: 'bilmuh',
            delayWhileIdle: true,
            dryRun: true,
            data: {
                type: 0,
                title: "",
                message: ""
            }
        });

        users.getAllRegIds(function (regIDs) {

            sender.send(message, regIDs, 4, function (err, result) {
                if (err) throw err;
                callback(result, regIDs);
            });

        });
    },

    isRegIdValid: function (reg_id, callback) {

        var message = new gcm.Message({
            collapseKey: 'bilmuh',
            delayWhileIdle: true,
            dryRun: true,
            data: {
                type: 0,
                title: "",
                message: ""
            }
        });

        sender.send(message, reg_id, 2, function (err, result) {
            if (err) throw err;
            callback(result.success == 1);
        });
    }

};
