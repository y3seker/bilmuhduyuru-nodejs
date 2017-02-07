require('dotenv').load();
var CronJob = require('cron').CronJob;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes');
var check = require('./check');
var database = require('./database');

var port = (process.env.OPENSHIFT_NODEJS_PORT || 5000);
var ip = (process.env.OPENSHIFT_NODEJS_IP === undefined ? '127.0.0.1' : process.env.OPENSHIFT_NODEJS_IP);

process.env.TZ = 'Europe/Istanbul';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.set('json spaces', 2);

module.exports.urlencodedParser = bodyParser.urlencoded({
    extended: false
});

app.use(express.static('doc'));

module.exports.env = app.get('env');
routes(app);

app.listen(port, ip, function () {
    console.log('%s \nNode server started on %s:%d ...',
        Date(Date.now()), ip, port);
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

process.on('exit', function () {
    database.close();
});

var job = new CronJob('0 */10 6-19 * * 1-6', function () {
    check.checkBilmuh();
}, null, false, process.env.TZ);

database.open(function () {
    check.checkBilmuh();
    job.start();
    console.log("ENV = " + module.exports.env);
});
