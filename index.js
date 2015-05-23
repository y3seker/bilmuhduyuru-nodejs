var express = require('express');
var app = express();
var routes = require('./routes/routes.js');
var check = require('./routes/check');
var checkn = require('./routes/check-n');
var database = require('./routes/database');
var bodyParser = require('body-parser');

process.env.TZ = 'Europe/Istanbul';
app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.json());

var getIP = function (cb) {
    var ip = process.env.OPENSHIFT_NODEJS_IP;
    if (ip === undefined) {
        console.error("IP is undefined, setting localhost.");
        ip = '127.0.0.1';
    }
    cb(ip);
}

var port = (process.env.OPENSHIFT_NODEJS_PORT || 5000);
var ip;
getIP(function (_ip) {
    ip = _ip;
    module.exports.ip = _ip;
    routes(app);
});


process.on('exit', function () {
    console.log('kapanıyor..');
    database.close();
});

app.listen(port, ip, function () {
    console.log('%s \nNode server started on %s:%d ...',
        Date(Date.now()), ip, port);
});

database.open(function () {
    check.doRoutineCheck(function () {});
});

var minutes = 10,
    the_interval = minutes * 60 * 1000;
setInterval(function () {
    check.doRoutineCheck(function () {});
}, the_interval);