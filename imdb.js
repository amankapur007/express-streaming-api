const configApi = require('./config')
const trakt = configApi.getTrakt();

function imdbMovie(page, limit) {
    moviesList = [];
    return []
    //new Promise((resolve, reject) => {
        trakt.users.id.lists({
            'page': page,
            'limit': limit
        }).then((movies) => {
            console.log(movies);
        }).catch((error) => {
            console.error(error.toString());
            return moviesList;
        });
}

function getImageUrl(ids) {
    ids['type'] = 'movie'
    return trakt.images.get(ids);
}

module.exports = {
    imdbMovie
}