var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

var self = module.exports = {

    tweet: function (message) {
        client.post('statuses/update', {
            status: message
        }, function (error, tweet, response) {
            if (error) {
                console.error(error);
                return;
            }
            console.log("Tweeted: " + message);
        });
    },

    tweetTheList: function (newAnncs) {
        newAnncs.forEach(function (annc) {
            self.tweet(self.generateMessage(annc));
        });
    },

    generateMessage: function (annc) {
        var result = "";
        if (annc.title.length > 116) {
            result += annc.title.slice(0, 113) + "...";
        } else {
            result += annc.title;
        }
        result += " " + annc.url;
        return result;
    }
};
