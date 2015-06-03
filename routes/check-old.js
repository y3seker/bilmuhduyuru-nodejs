var request = require('request')
var cheerio = require('cheerio');
var gcm = require('./gcm');
var tr = require('turkish-char-encoding');
var anncs = require('./anncs');
var anncsDB = require('./anncs2');
var async = require('async');
var entities = require('cheerio/node_modules/entities');

var last_index = '';

var bilmuhURL = 'http://bilmuh.ege.edu.tr';
var egeDuyuruURL = 'http://egeduyuru.ege.edu.tr/index.php?bolumid=2';
var egeDuyuruAbsURL = 'http://egeduyuru.ege.edu.tr/';

var foundList = [];
var list21 = [];

var self = module.exports = {

    doRoutineCheck: function (callback) {

        self.getUpToDateAnnc(function () {

            if (foundList.length > 0) {

                self.writeToDB(function (cb) {
                    if (cb.length > 0) {

                        console.log(cb.length + ' New annc. found. Writing n Sending..');

                        gcm.sendMessageToAll({
                            duyuru: 'Yeni'
                        }, function (response) {
                            if (response != null && response.success > 0) {
                                console.log(response);
                                console.log('Message sent to ' + response.success + ' people.');
                            } else {
                                console.log(response);
                                console.log('Message can not sent');
                            }
                        });

                    }

                });

            } else {
                callback(0);
                console.log('No new annc. Keep tracking...');
            }

        });

    },

    getUpToDateAnnc: function (callback) {

        foundList = [];

        var options = {
            url: egeDuyuruURL,
            encoding: null,
            headers: {
                'User-Agent': 'request',
                'Content-Type': 'charset=iso-8859-9'
            }
        };

        function callback123(err, resp, body) {

            if (!err && resp.statusCode == 200) {

                var bodyUTF8 = tr('iso-8859-9').toUTF8(body);
                var $ = cheerio.load(bodyUTF8);
                var list20 = $('td[width=365]').slice(0, 20);

                var findFunc = function (obj, done) {
                    var cont_url = egeDuyuruAbsURL + $(obj).children().children().children().attr('href');
                    var title_ = $(obj).text().replace(/\n/gi, '');
                    var date_ = $(obj).next().text().replace(/\n /gi, '');
                    var index_ = parseInt(cont_url.slice(31, 36), 10);

                    anncs.findByIndex(index_, function (found) {
                        if (found != undefined && found.length == 0) {
                            var meta_data = {
                                title: title_,
                                url: cont_url,
                                date: date_,
                                cont: 'null',
                                index: index_
                            };
                            console.log(index_ + " is new, added foundList.");
                            foundList.push(meta_data);
                            done();
                        } else {
                            if (title_.toLowerCase().indexOf("güncellen") > -1) {
                                console.log(index_ + " This might be updated.");
                            }
                            done();
                        }
                    });
                };
                var cbFunc = function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback();
                };

                async.forEach(list20, findFunc, cbFunc);

            } else {
                console.log('Can not connect to EGE. ' + err);
            }

        }
        request(options, callback123);

    },

    checkForNew: function (callback) {

        getUpToDateAnnc(function () {

            if (foundList.length > 0) {

                writeToDB(function (cb) {

                    if (cb.length > 0) {
                        callback(1);

                        gcm.sendMessageToAll({
                            duyuru: 'Yeni'
                        }, function (response) {
                            if (response != null && response.success > 0) {
                                console.log(response);
                                console.log('Message sent to ' + response.success + ' people.');
                            } else {
                                console.log(response);
                                console.log('Message can not sent');
                            }
                        });

                    }

                });
            } else {
                callback(0);
            }

        });

    },

    getFromStrach: function () {
        var allDuyurus = [];
        var options = {
            url: egeDuyuruURL,
            encoding: null,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'text/html, charset=iso-8859-9'
            }
        };

        function callback2(err, resp, body) {

            var counter = 0;
            if (!err && resp.statusCode == 200) {

                var bodyUTF8 = tr('iso-8859-9').toUTF8(body);

                var $ = cheerio.load(bodyUTF8);

                $('td[width=365]').each(function (i, element) {

                    var cont_url = egeDuyuruAbsURL + $(this).children().children().children().attr('href');
                    var title_ = $(this).text();
                    var date_ = $(this).next().text().replace(/\r\n/gi, '');
                    var index_ = parseInt(cont_url.slice(50, cont_url.length), 10);

                    if (counter <= 1000) {
                        counter++;
                        var meta_data = {
                            title: title_,
                            url: cont_url,
                            date: date_,
                            cont: 'null',
                            index: index_
                        };

                        foundList.push(meta_data);
                    }

                });

                //callback({response: allDuyurus})
                writeToDB(function (cb) {
                    console.log("Writing done.");
                });
            } else {
                console.log('Can not connect to EGE. ' + err);
            }
        }
        request(options, callback2);

    },

    // Yeni duyurulari veritabanina yazar

    writeToDB: function (callback) {
        var cb_list = [];
        var saveFunc = function (obj, done) {
            cb_list.push(obj);
            self.getContentOfAnnc(obj.url, function (cb) {
                obj.cont = cb;
                anncs.addNewAnnc(obj.title, obj.url, obj.date, cb, obj.index, function (cb) {
                    done();
                });

            });
        };

        var doneIteration = function (err) {
            if (err) return console.error(err);
            callback(cb_list);
            console.log(cb_list.length + ' New annc.(s) has been written');
        };
        async.forEach(foundList, saveFunc, doneIteration);

    },

    writeToDBNew: function (list, callback) {
        var insideList = list;

        var saveFunc = function (obj, done) {
            getContentOfAnnc(obj.url, function (cb) {
                obj.cont = cb;
                obj.date = new Date(parseDate(obj.date));
                anncsDB.addNewAnnc(obj.title, obj.url, obj.date, cb, obj.index, function (cb) {
                    done();
                });

            });
        };

        var doneIteration = function (err) {
            if (err) return console.error(err);
            callback(insideList);
            console.log(cb_list.length + ' New annc.(s) has been written');
        };
        async.forEach(insideList, saveFunc, doneIteration);

    },

    parseDate: function (text) {
        text = text.replace('/ /gi', '');
        console.log(text);
        return text;
    },

    getLastAnnc: function () {
        anncs.getLastAnnc(function (cb) {
            if (cb != -1) {
                last_index = cb.index;
                console.log(last_index + ' Last annc. set. Starting routine...');

                doRoutineCheck(function (cb) {});
            } else
                return false;
        });
    },

    // Duyuru icerigini alir, html formunda callback yapar

    getContentOfAnnc: function (url_, callback) {
        var content;

        var options = {
            url: url_,
            encoding: null,
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Content-Type': 'text/html, charset=iso-8859-9'
            }
        };

        function callback_(err, resp, body) {

            if (!err && resp.statusCode == 200) {
                // don't do escaping of the attribute values and text nodes
                // and so far it's the only place where it's used
                entities.escape = function (str) {
                    return str;
                }
                entities.encodeXML = function (str) {
                    return str;
                }

                var bodyUTF8 = tr('iso-8859-9').toUTF8(body);

                var $ = cheerio.load(bodyUTF8);

                content = $('font[color=#000000]').html();
                content = content.replace(/href=\"\//gi, "href=\"http://egeduyuru.ege.edu.tr/");
                //console.log(content);
            } else {
                callback('Bu içerik veritabanına eklenmemiş, tarayıcıda açmayı deneyin.');
                return console.error('Baglanti hatasi ' + err);
            }

            callback(content);

        };
        request(options, callback_);

    },
};
