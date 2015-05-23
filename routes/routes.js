var index = require('../index');
var gcm = require('./gcm');
var users = require('./users');
var anncs = require('./anncs');
var check = require('./check');
var utils = require('./utils');

module.exports = function (app) {

    app.get('/duyurular', function (req, res) {

        anncs.getAllAnncs(function (cb) {
            res.json(cb.response);
        });

    });

    app.get('/duyurular/:count([0-9]+)', function (req, res) {
        anncs.getSizeOfAnncs(req.params.count, function (cb) {
            res.json(cb.response);
        });
    });

    app.get('/dahayeni?n=:count([0-9]+)', function (req, res) {
        check.checkForNew(function (cb) {
            anncs.getNews(req.params.count, function (cb) {
                res.json(cb);
            });
        });
    });

    app.get('/kontrolet', function (req, res) {
        check.checkForNew(function (cb) {
            res.send(cb);
        });
    });


    if (index.ip === '127.0.0.1') {

        app.get('/admin', function (req, res) {
            res.sendfile('./html/admin.html');
        });

        app.get('/check-users', function (req, res) {
            gcm.sendDryMsgToAll("", function (result, users) {
                res.redirect('/all-users');
                utils.deleteUnreachableUsers(result, users);
            });
        });

        app.get('/all-users', function (req, res) {

            users.getAllUsers(function (cb) {
                res.send(cb);
            });

        });

        app.post('/send-message', function (req, res) {

            gcm.sendMessage(req.body.s_id, req.body.s_message, function (result) {
                res.send(result);
            });

        });
    }

};