const Trakt = require('@amankapur007/trakt.tv');

let options = {
    client_id: 'a841e3df41527e96093401fa7eb0a029434dd37ee7919571c5bce909f1fb54f8',
    client_secret: '6e20674c3d85c309f439f00a25dff5f5572a5a7caf2ef47ef16b3d412d50dc7c',
    pagination: true,      // defaults to false, global pagination (see below)
    plugins: {
        images: require('trakt.tv-images'),
    },
    options: {
        images: {
            smallerImages: true,
            cached: true,
            fanartApiKey: '71331003d41f89b1c58b2a69088d428b',
        }
    }
};

const trakt = new Trakt(options);

var token = {
    access_token:
        '097624820b65d2451c350bef9340bf8865d9fba00e4679e3c9425e3a9ba35b34',
};

trakt.import_token(token);

function getTrakt(){
    return trakt;
}

module.exports = {
    getTrakt
}
