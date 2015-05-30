var index = require('../index');
var gcm = require('./gcm');
var users = require('./users');
var anncs = require('./anncs2');
var check = require('./check-n');
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

    app.get('/kontrolet', function (req, res) {
        check.checkForNew(function (cb) {
            res.send(cb);
        });
    });


    app.post('/kayit', function (req, res) {

        if (req.body.key === utils.registerKey) {
            users.add(req.body.reg_id, function (cb) {
                res.json(cb);
            });
        } else {
            console.log('Register: Invalid register key ' + req.body.key);
            var cb = {
                regID: "",
                regCode: 0
            }
            res.json(cb);
        }
    });

    // LOCALHOST FUNCTIONS
    if (index.ip === '127.0.0.1') {

        app.get('/admin', function (req, res) {
            res.sendfile('./html/admin.html');
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
            var message = gcm.createMessage(gcm.types.TEST, "Test", req.body.s_message);
            gcm.sendMessage(req.body.s_id, message, function (result) {
                res.send(result);
            });

        });

    };

    app.get('*', function (req, res) {
        res.send("404", 404);
    });


};