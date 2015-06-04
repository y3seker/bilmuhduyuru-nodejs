var request = require('request')
var cheerio = require('cheerio');
var tr = require('turkish-char-encoding');
var async = require('async');
var parser = require('xml2js');
var sanitizeHtml = require('sanitize-html');

var anncs = require('./anncs');
var gcm = require('./gcm');
var Utils = require('./utils');

var bilmuhList = [];

var bilmuhURL = 'http://bilmuh.ege.edu.tr';
var egeDuyuruURL = 'http://egeduyuru.ege.edu.tr/index.php?bolumid=2';
var egeDuyuruAbsURL = 'http://egeduyuru.ege.edu.tr/';


var self = module.exports = {

    check: function () {
        self.doCheck(function (news, updated) {
            if (news.length != 0)
                gcm.sendMessageToAll(gcm.createMessage(gcm.types.NEW, "", ""), function () {});
            if (updated.length != 0)
                gcm.sendMessageToAll(gcm.createMessage(gcm.types.UPDATE, updated.length + " Duyuru Güncellendi",
                    updated), function () {});
        });
    },

    doCheck: function (callback) {

        var updated = [];
        var news = [];

        var options = {
            url: egeDuyuruURL,
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=iso-8859-9'
            }
        };

        function requestCallback(err, resp, body) {

            if (err || resp.statusCode != 200)
                throw ('Can not connect to EGEDUYURU. ' + err);

            //var bodyUTF8 = tr('iso-8859-9').toUTF8(body);
            var $ = cheerio.load(body);
            var list20 = $('td[width=365]').slice(0, 250);

            var findFunc = function (obj, done) {
                var url = egeDuyuruAbsURL + $(obj).children().children().children().attr('href');
                var index = parseInt(url.slice(31, 36), 10);
                var rssURL = [url.slice(0, 30), 'i', url.slice(30)].join('');
                anncs.findByIndex(index, function (result) {
                    if (result != undefined && result.length == 0) {
                        self.getContent(rssURL, index, function (data) {
                            news.push(data);
                            self.writeToDB(data, index);
                            done();
                        });
                    } else {
                        self.getContent(rssURL, index, function (data) {
                            if (result[0].title != data.title || result[0].content != data.content) {
                                updated.push(data);
                                data._id = undefined;
                                data.__v = undefined;
                                anncs.updateByIndex(index, data, function () {
                                    done();
                                });
                            } else {
                                done();
                            }
                        });
                    }
                });

            }

            var cbFunc = function (err) {
                if (err) throw err;
                callback(news, updated);
                var date = new Date(Date.now());
                console.log("U: " + updated.length + " N: " + news.length + " at " + date.toLocaleString('tr-TR'));
            };

            async.forEach(list20, findFunc, cbFunc);
        }
        request(options, requestCallback);
    },

    getContent: function (rssURL, index, callback) {
        request({
            url: rssURL,
            xmlMode: true,
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=iso-8859-9'
            }
        }, function (err, resp, body) {
            if (err || resp.statusCode != 200) throw (index + 'Can not connect to EGEDUYURU RSS. ' + err);;
            var bodyUTF8 = tr('iso-8859-9').toUTF8(body);
            parser.parseString(bodyUTF8, {
                explicitArray: false,
                ignoreAttrs: true
            }, function (err, result) {
                var data = result.rss.channel.item;
                data.description = sanitizeHtml(data.description);
                data.icerik = data.icerik.replace(/href='\/d/gi, "href='http://egeduyuru.ege.edu.tr/d");
                data.icerik = data.icerik.replace(/href=\"\/d/gi, "href=\"http://egeduyuru.ege.edu.tr/d");
                var annc = anncs.create(data.description, data.link, data.tarih, data.icerik, index);
                callback(annc);
            });
        });
    },

    writeToDB: function (annc, index) {
        anncs.add(annc, function (cb) {});
    },

    findBilmuhList: function (callback) {
        var finalList = [];
        var options = {
            url: bilmuhURL,
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

            // async foreach

            var findFunc = function (obj, done) {
                var url = $(obj).attr('href');
                var index_ = parseInt(url.slice(30, 35), 10);
                finalList.push(index_);
                done();
            };

            var cbFunc = function (err) {
                if (err) throw err;

                if (callback)
                    callback(finalList);
            };

            async.forEach(list, findFunc, cbFunc);

        }
        request(options, requestCallback);
    }

};
