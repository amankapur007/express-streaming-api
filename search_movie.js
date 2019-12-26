const fetch = require('node-fetch');
const cheerio = require('cheerio');

const url = 'https://www.imdb.com/find?s=tt&ref_=fn_al_tt_mr&q=';
const movieUrl = 'https://www.imdb.com/title/';

function searchMovies(searchTerm) {
    console.log(`${url}${searchTerm}`)
    return fetch(`${url}${searchTerm}`)
        .then(response => response.text())
        .then(body => {
            const movies = [];
            const $ = cheerio.load(body);
            $('.findResult').each(function (i, element) {
                const $element = $(element);
                const $image = $element.find('td a img');
                const $title = $element.find('td.result_text a');
                const imdbId = $title.attr('href').match(/title\/(.*)\//)[1];
                const movie = {
                    image: $image.attr('src'),
                    title: $title.text(),
                    id:imdbId
                }
                movies.push(movie);
            });
            return movies;
        });
}

function getMovie(id){
    return fetch(`${movieUrl}${id}`)
        .then(response => {
            return response.text();
        })
        .then(body=>{
            console.log(body);
            const $ = cheerio.load(body);
            const $title = $('.title_wrapper h1');

            const title = $title.first().contents().filter(function(){
                return this.type === 'text';
            }).text().trim();
            return {
                title
            };
        });
}

module.exports = {
    searchMovies,
    getMovie
}

