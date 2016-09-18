var _app = require('./app');
var gcm = require('./gcm');
var users = require('./users');
var anncs = require('./anncs');
var check = require('./check');
var utils = require('./utils');
var twitter = require('./twitter');

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

    app.get('/duyuru/:index([0-9]+)', function (req, res) {
        anncs.findByIndex(req.params.index, function (cb) {
            res.json(cb);
        });
    });
    
    app.get('/dahayeni/:index([0-9]+)', function (req, res) {
        anncs.getNewer(req.params.index, function (cb) {
            res.json(cb);
        });
    });
    
    app.get('/dahayeni/:date([0-9-]+)', function (req, res) {
        var date = new Date(req.params.date);
        anncs.getNewerByDate(date, function (cb) {
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
    if (_app.env === 'development') {

        app.get('/admin', function (req, res) {
            res.sendFile(__dirname.replace("js", "html") + '/admin.html');
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

        app.get('/twitOne', function (req, res) {
            anncs.getSizeOf(1, function (cb) {
                twitter.twitTheList(cb);
            });
            res.send('Tweeted!');
        });

        app.post('/twitCount', function (req, res) {
            anncs.getSizeOf(req.body.tweet_count, function (cb) {
                twitter.twitTheList(cb.reverse());
            });
            res.send('Tweeted 2!');
        });

    };

    app.get('*', function (req, res) {
        res.status(404).send("404");
    });


};
