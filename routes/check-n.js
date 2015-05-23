var request = require('request')
var cheerio = require('cheerio');
var tr = require('turkish-char-encoding');
var async = require('async');
var entities = require('cheerio/node_modules/entities');
var anncs = require('./anncs');
var gcm = require('./gcm');

var last_index = '';

var bilmuhList = [];

var egeDuyuru = 'http://egeduyuru.ege.edu.tr/index.php?bolumid=2';
var bilmuh = 'http://bilmuh.ege.edu.tr/';
var absHref = 'http://egeduyuru.ege.edu.tr/';

module.exports = {

    findBilmuhList: function (callback) {
        //finalList.clear();
        var finalList = [];
        var options = {
            url: bilmuh,
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=iso-8859-9'
            }
        };

        function requestCallback(err, resp, body) {

            if (err || resp.statusCode != 200)
                throw ('Can not connect to BILMUH. ' + err);

            var bodyUTF8 = tr('iso-8859-9').toUTF8(body);
            var $ = cheerio.load(bodyUTF8);
            var list = $('a[class=gunlukliste]');

            var findFunc = function (obj, done) {
                var url = $(obj).attr('href');
                var index_ = parseInt(url.slice(30, 35), 10);
                finalList.push(index_);
                done();
            };

            var cbFunc = function (err) {
                if (err) throw err;
                //return finalList;
                if (callback)
                    callback(finalList);
            };

            async.forEach(list, findFunc, cbFunc);

        }
        request(options, requestCallback);
    }

};