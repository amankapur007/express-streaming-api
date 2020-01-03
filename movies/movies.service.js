const configApi = require('../config')
const trakt = configApi.getTrakt();

async function getMovieById(id, query) {
    var moviesList = [];
    return new Promise((resolve, reject) => {
        trakt.movies.summary({
            "id": id
        },query).then((movie) => {
            movies = {};
            movies.data = [movie.data];
            var index = 0;
            movies.data.forEach(async (data, i) => {
                data = {
                    movie: data
                }
                imageUrl = await getImageUrl(data.movie.ids);
                movieObject = {
                    title: data.movie.title,
                    year: data.movie.year,
                    id: data.movie.ids.imdb,
                    image: imageUrl.poster
                }
                index++;
                delete(data.movie.ids);
                moviesList.push(Object.assign(movieObject,data.movie));
                if (index == movies.data.length) {
                    resolve(moviesList);
                }
            });
        }).catch((error) => {
            console.log('error', error.toString());
            return moviesList;
        })
    })
}



function getImageUrl(ids) {
    ids['type'] = 'movie'
    return trakt.images.get(ids);
}

module.exports = {
    getMovieById
}