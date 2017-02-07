var _app = require('./app');
var gcm = require('./gcm');
var users = require('./users');
var anncs = require('./anncs');
var check = require('./check');
var utils = require('./utils');
var twitter = require('./twitter');

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname.replace("js", "doc") + '/index.html');
    });

    /**
     * @api {get} /duyurular All announcements
     * @apiName duyurular
     * @apiGroup Anncs
     *
     * @apiSuccess {json} response List of announcements
     * @apiError   {json} response Empty list
     */
    app.get('/duyurular', function (req, res) {
        anncs.getAll(function (cb) {
            res.json(cb);
        });
    });

    /**
     * @api {get} /duyurular/:count Count of announcements
     * @apiName duyurular_count
     * @apiGroup Anncs
     *
     * @apiParam {Integer} count Count of announcements
     *
     * @apiSuccess {json} response List of announcements
     * @apiError   {json} response Empty list
     */
    app.get('/duyurular/:count([0-9]+)', function (req, res) {
        anncs.getSizeOf(req.params.count, function (cb) {
            res.json(cb);
        });
    });

    /**
     * @api {get} /duyuru/:index Get the announcement
     * @apiName duyuru
     * @apiGroup Annc
     *
     * @apiParam {Integer} index Index of desired announcement 
     *
     * @apiSuccess {json} response Announcement in a list
     * @apiError   {json} response Empty list
     */
    app.get('/duyuru/:index([0-9]+)', function (req, res) {
        anncs.findByIndex(req.params.index, function (cb) {
            res.json(cb);
        });
    });

    /**
     * @api {get} /dahayeni/:index Newer announcements by index
     * @apiName dahayeni_index
     * @apiGroup Anncs
     *
     * @apiParam {Integer} index Index of announcement to get newer ones
     *
     * @apiSuccess {json} response  List of announcements
     * @apiError   {json} response Empty list
     */
    app.get('/dahayeni/:index([0-9]+)', function (req, res) {
        anncs.getNewer(req.params.index, function (cb) {
            res.json(cb);
        });
    });

    /**
     * @api {get} /dahayeni/:date Newer announcements by date
     * @apiName dahayeni_date
     * @apiGroup Anncs
     *
     * @apiParam {Date} date Date string. e.g. "2016.01.01" or "2016-01-01" 
     *
     * @apiSuccess {json} response List of announcements
     * @apiError   {json} response Empty list with 404
     */
    app.get('/dahayeni/:date([0-9-/\. ]+)', function (req, res) {
        var date = new Date(req.params.date);
        if (date.isValid()) {
            anncs.getNewerByDate(date, function (cb) {
                res.json(cb);
            });
        } else {
            res.status(404).send("[]");
        }
    });

    /**
     * @api {post} /kayit/ User registration
     * @apiName kayit
     * @apiGroup User
     *
     * @apiParam {String} reg_id Users GCM register identification 
     *
     * @apiSuccess {json} response Success info
     * @apiSuccessExample {json} Success-Response:
     *      {
     *         regID: "GCM_REG_ID",
     *         regCode: 1 
     *      }
     * @apiError   {json} response Error info
     * @apiErrorExample {json} Error-Response:
     *     {
     *          regID: "",
     *          regCode: 0
     *      }
     */
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
                twitter.tweetTheList(cb);
            });
            res.send('Tweeted!');
        });

        app.post('/twitCount', function (req, res) {
            anncs.getSizeOf(req.body.tweet_count, function (cb) {
                twitter.tweetTheList(cb.reverse());
            });
            res.send('Tweeted ' + req.body.tweet_count);
        });

    };

    app.get('*', function (req, res) {
        res.status(404).send("404");
    });

};