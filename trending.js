const fetch = require('node-fetch');
const cheerio = require('cheerio');

const trendingUrl = 'https://trakt.tv/movies/trending';

function trending(){
    return fetch(`${trendingUrl}`)
    .then((response)=>response.text())
    .then((body)=>{
        const $ = cheerio.load(body);
        var movies = [];
        $('.fanarts .grid-item').each((i,element)=>{
            $element = $(element);
            $title = $element.find('a .fanart .titles h3').children() //select all the children
            .remove()   //remove all the children
            .end();
            $image = $element.find('a meta');
            movie = {
                title:$title.text().trim(),
                image:$image.attr('content')
            }
            if(movie.title && movie.image){
            movies.push(movie);
            }
        });
        return movies;
    });
}

module.exports = {
    trending
}