var mongoose = require('mongoose');

var anncSchema = mongoose.Schema({
    title: String,
    url: String,
    date: Date,
    cont: String,
    index: Number,
    created: Date
});

var Annc = mongoose.model('AnncNew', anncSchema);

module.exports = {

    addNewAnnc: function (title_, url_, date_, content_, index_, callback) {

        var annc01 = new Annc({
            title: title_,
            url: url_,
            date: date_,
            cont: content_,
            index: index_,
            created: Date().now()
        });

        annc01.save(function (err, product, numberAffected) {
            if (err) {
                callback(undefined);
                return console.error(err);
            }

            callback(product);
        });

    },

    getAllAnncs: function (callback) {
        Annc.find({}).sort({
            index: -1
        }).limit(500).exec(function (err, docs) {
            if (err) {
                callback(undefined);
                return console.error(err);
            }
            callback(docs);
        });
    },

    getSizeOfAnncs: function (count, callback) {
        Annc.find({}).sort({
            index: -1
        }).limit(count).exec(function (err, docs) {
            if (err) {
                callback(undefined);
                return console.error(err);
            }
            callback(docs);
        });
    },

    getLastAnnc: function (callback) {
        Annc.findOne({}).sort({
            index: -1
        }).exec(function (err, doc) {
            if (err) {
                callback(undefined);
                return console.error(err);
            }

            callback(doc);
        });

    },
    getNews: function (lastindex, callback) {

        Annc.find({
            index: {
                $gt: lastindex
            }
        }).sort({
            index: -1
        }).exec(function (err, docs) {
            if (!err) {
                callback(undefined);
                return console.error(err);
            }
            callback(docs);
        });

    },

    findByIndex: function (i, callback) {

        Annc.find({
            index: i
        }, function (err, doc) {
            if (err) {
                callback(undefined);
                return console.error(err);

            }
            callback(doc);

        });

    },

    updateAll: function () {

        Annc.find({}).sort({
            url: -1
        }).exec(function (err, docs) {

            for (var i = docs.length - 1; i >= 0; i--) {
                var preint = docs[i].url.slice(50, docs[i].url.length);
                var update = {
                    index: parseInt(preint, 10)
                };

                Annc.findOneAndUpdate({
                    url: docs[i].url
                }, update, function (cb2) {
                    console.log(cb2);
                });

            };

        });

    }


};