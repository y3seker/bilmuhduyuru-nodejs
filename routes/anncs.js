var mongoose = require('mongoose');

var anncSchema = mongoose.Schema({
    title: String,
    url: String,
    date: Date,
    content: String,
    index: Number,
    created: Date
});

var Annc = mongoose.model('NewAnnc', anncSchema);

var self = module.exports = {

    create: function (title_, url_, date_, content_, index_) {
        return new Annc({
            title: title_,
            url: url_,
            date: new Date(date_),
            content: content_,
            index: index_,
            created: Date.now()
        });
    },

    add: function (annc, callback) {

        annc.save(function (err, product, numberAffected) {
            if (err) {
                callback(undefined);
                return console.error(err);
            }
            callback(product);
        });

    },

    getAll: function (callback) {
        Annc.find({}, '-_id -__v').sort({
            index: -1
        }).limit(500).exec(function (err, docs) {
            if (err) throw err;
            callback(docs);
        });
    },

    getSizeOf: function (count, callback) {
        Annc.find({}, '-_id -__v').sort({
            index: -1
        }).limit(count).exec(function (err, docs) {
            if (err) throw err;
            callback(docs);
        });
    },

    getLastAnnc: function (callback) {
        Annc.findOne({}, '-_id -__v').sort({
            index: -1
        }).exec(function (err, doc) {
            if (err) throw err;
            callback(doc);
        });

    },
    getNewer: function (lastindex, callback) {

        Annc.find({
            index: {
                $gt: lastindex
            }
        }, '-_id -__v').sort({
            index: -1
        }).exec(function (err, docs) {
            if (err) throw err;
            callback(docs);
        });

    },

    findByIndex: function (i, callback) {

        Annc.find({
            index: i
        }, '-_id -__v', function (err, doc) {
            if (err) throw err;
            callback(doc);
        });

    },

    updateByIndex: function (index, data, callback) {

        Annc.findOneAndUpdate({
            index: index
        }, data, function (err, doc) {
            if (err) throw err;
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
