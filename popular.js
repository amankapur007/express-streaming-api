const configApi = require('./config')
const trakt = configApi.getTrakt();

function popular(page, limit) {
    moviesList = [];
    return new Promise((resolve, reject) => {
        trakt.movies.popular({
            'page': page,
            'limit': limit
        }).then((movies) => {
            var index = 0;
            movies.data.forEach(async (data, i) => {
                    data ={
                        movie:data
                    }
                    imageUrl = await getImageUrl(data.movie.ids);
                    movieObject = {
                        title: data.movie.title,
                        year: data.movie.year,
                        id: data.movie.ids.imdb,
                        image: imageUrl.poster
                    }
                    index++;
                    moviesList.push(movieObject);
                    if (index == movies.data.length) {
                        resolve(moviesList);
                    }
            });
        }).catch((error) => {
            console.error(error.toString());
            return moviesList;
        });
    })
}

function getImageUrl(ids) {
    ids['type'] = 'movie'
    return trakt.images.get(ids);
}

module.exports = {
    popular
}