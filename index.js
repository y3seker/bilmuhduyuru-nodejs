var express = require('express');
var app = express();
var routes = require('./routes/routes.js');
var check = require('./routes/check');
var checkn = require('./routes/check-n');
var database = require('./routes/database');
var bodyParser = require('body-parser');
var request = require('request');

var self_url = 'http://bilmuh-y3seker.rhcloud.com/duyurular';

var port = (process.env.OPENSHIFT_NODEJS_PORT || 5000);
var ip = (process.env.OPENSHIFT_NODEJS_IP === undefined ? '127.0.0.1' : process.env.OPENSHIFT_NODEJS_IP);

process.env.TZ = 'Europe/Istanbul';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

module.exports.env = app.get('env');
routes(app);

app.listen(port, ip, function () {
    console.log('%s \nNode server started on %s:%d ...',
        Date(Date.now()), ip, port);
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Bir şeyler ters gitti!');
});

process.on('exit', function () {
    database.close();
});

database.open(function () {
    checkn.check();
});

var minutes = 10,
    the_interval = minutes * 60 * 1000;
setInterval(function () {
    checkn.check();
}, the_interval);
