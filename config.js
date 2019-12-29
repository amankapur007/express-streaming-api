const Trakt = require('trakt.tv');

let options = {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    pagination: true,      // defaults to false, global pagination (see below)
    plugins: {
        images: require('trakt.tv-images'),
    },
    options: {
        images: {
            smallerImages: true,
            cached: true,
            fanartApiKey: process.env.IMG_KEY,
        }
    }
};

const trakt = new Trakt(options);

var token = {
    access_token:
    process.env.ACCESS_TOKEN,
};

trakt.import_token(token);

function getTrakt(){
    return trakt;
}

module.exports = {
    getTrakt
}
