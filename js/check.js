var request = require('request');
var cheerio = require('cheerio');
var tr = require('turkish-char-encoding');
var async = require('async');
var parser = require('xml2js');
var sanitizeHtml = require('sanitize-html');

var app = require('./app');
var anncs = require('./anncs');
var gcm = require('./gcm');

var bilmuhURL = 'http://bilmuh.ege.edu.tr';

// unused
var egeDuyuruURL = 'http://egeduyuru.ege.edu.tr/index.php?bolumid=2';
var egeDuyuruAbsURL = 'http://egeduyuru.ege.edu.tr/';
var twitter = require('./twitter');

// last annc index before the website update, there is no index for annc anymore
// new index calculation -> index = lastAnncIndex + articleID
var lastAnncIndex = 12820;

var self = module.exports = {

    checkBilmuh: function () {
        var updated = [];
        var news = [];
        request({
            url: 'http://bilmuh.ege.edu.tr/duyurular?page=0',
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=iso-8859-9'
            }
        }, function (err, resp, body) {
            if (err || resp.statusCode !== 200) {
                console.error('Can not connect to BILMUH.EGE.EDU.TR ' + err);
                return;
            }

            var $ = cheerio.load(body, {
                normalizeWhitespace: true
            });

            var anncList = $('div[id=main-content]').find($('div[class=view-content]')).children();
            var count = anncList.length;
            anncList.each(function (i, elem) {
                var _annc = $(this).children().first();
                var index = parseInt(_annc.attr("id").replace("article-", "").trim()) + lastAnncIndex;
                var title = _annc.children().first().text().trim();
                var url = bilmuhURL + _annc.children().first().children().children().attr("href");
                anncs.findByIndex(index, function (result) {
                    if (result !== undefined && result.length === 0) {
                        self.getBilmuhContent(url, index, title, function (data) {
                            news.push(data);
                            self.writeToDB(data, index);
                            if (!--count) self.finishCheck(news, updated);
                        });
                    } else {
                        self.getBilmuhContent(url, index, title, function (data) {
                            if (result[0].title !== data.title || result[0].content !== data.content) {
                                updated.push(data);
                                data._id = undefined;
                                data.__v = undefined;
                                anncs.updateByIndex(index, data, function () {});
                            }
                            if (!--count) self.finishCheck(news, updated);
                        });
                    }
                });
            });
        });
    },

    finishCheck: function (news, updated) {
        var date = new Date(Date.now());
        console.log("U: %d N: %d at %s", updated.length, news.length, date.toLocaleString('tr-TR'));

        if (news.length !== 0) {
            gcm.sendMessageToAll(gcm.createMessage(gcm.types.NEW, "", ""), function () {});
        }

        //if (updated.length != 0)
        //    gcm.sendMessageToAll(gcm.createMessage(gcm.types.UPDATE, updated.length + " Duyuru Güncellendi",
        //        updated), function () {});
    },

    getBilmuhContent: function (url, index, title, callback) {
        request({
            url: url,
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=utf-8'
            }
        }, function (err, resp, body) {
            if (err || resp.statusCode !== 200) {
                console.error(index + ' Can not connect to BILMUH.EGE.EDU.TR ' + err);
                return;
            }

            var $ = cheerio.load(body, {
                normalizeWhitespace: true
            });
            var selector = "div[id=\"article-" + (index - lastAnncIndex) + "\"]";
            var article = $(selector).children().first();
            var dateDiv = article.children().first();
            var contentDiv = article.children().first().next();
            var date = dateDiv.text().slice(0, 10).split("/");
            var dateString = date[2] + "-" + date[1] + "-" + date[0];
            var content = contentDiv.children().children().children();
            var annc = anncs.create(title, url, dateString, content, index);
            callback(annc);
        });
    },

    writeToDB: function (annc) {
        if (app.env !== 'development') {
            anncs.add(annc, function (cb) {});
        }
    },

    /**
     *   This one for egeduyuru.edu.tr and deprecated
     */
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

            if (err || resp.statusCode != 200) {
                console.error('Can not connect to EGEDUYURU. ' + err);
                return;
            }

            //var bodyUTF8 = tr('iso-8859-9').toUTF8(body);
            var $ = cheerio.load(body);
            var list20 = $('td[width=365]').slice(0, 20);

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
    /**
     *   This one for egeduyuru.edu.tr and deprecated
     */
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
            if (err || resp.statusCode != 200) {
                console.error(index + ' Can not connect to EGEDUYURU RSS. ' + err);
                return;
            }
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
    }

};
