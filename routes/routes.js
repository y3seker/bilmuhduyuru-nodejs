var index = require('../index');
var gcm = require('./gcm');
var users = require('./users');
var anncs = require('./anncs');
var check = require('./check');
var utils = require('./utils');

module.exports = function (app) {

    app.get('/duyurular', function (req, res) {
        anncs.getAll(function (cb) {
            res.json(cb);
        });
    });

    app.get('/duyurular/:count([0-9]+)', function (req, res) {
        anncs.getSizeOf(req.params.count, function (cb) {
            res.json(cb);
        });
    });

    app.get('/dahayeni/:index([0-9]+)', function (req, res) {
        anncs.getNewer(req.params.index, function (cb) {
            res.json(cb);
        });
    });

    app.post('/kayit', function (req, res) {
        gcm.isRegIdValid(req.body.reg_id, function (valid) {
            if (valid)
                users.add(req.body.reg_id, function (cb) {
                    res.json(cb);
                });
            else
                res.json({
                    regID: "",
                    regCode: 0
                });
        });

    });

    // LOCALHOST FUNCTIONS
    if (index.env === 'development') {

        app.get('/admin', function (req, res) {
            res.sendFile(__dirname + '/admin.html');
        });

        app.get('/check-users', function (req, res) {
            gcm.sendDryMsgToAll(function (result, users) {
                utils.deleteUnreachableUsers(result, users);
                res.redirect('/all-users');
            });
        });

        app.get('/all-users', function (req, res) {

            users.getAll(function (cb) {
                res.send(cb);
            });

        });

        app.post('/send-message', function (req, res) {
            var message = gcm.createMessage(req.body.s_type, req.body.s_title, req.body.s_message);
            gcm.sendMessage(req.body.s_id, message, function (result) {
                res.send(result);
            });

        });

        app.get('/send-message-all', function (req, res) {
            var message = gcm.createMessage(gcm.types.NEW, "", "");
            gcm.sendMessageToAll(message, function (result) {
                res.send(result);
            });

        });

        app.get('/kontrolet', function (req, res) {
            check.check();
            res.redirect('/duyurular');
        });

    };

    app.get('*', function (req, res) {
        res.status(404).send("404");
    });


};
