const fetch = require('node-fetch');
const cheerio = require('cheerio');
//const puppeteer = require('puppeteer');

const furl = 'https://fmovies.wtf/movies?page=';

function getMovies(page) {
    /*return  puppeteer
    .launch()
    .then(browser => browser.newPage())
    .then(page => {
      return page.goto(`${furl}`).then(function() {
        return page.content();
      });
    })*/
    return fetch(`${furl}${page}`)
        .then(response => response.text())
        .then(body => {
            const movies = [];
            const $ = cheerio.load(body);
            $('.movie-list .item').each(function (i, element) {
                const $element = $(element);
                const $quality = $element.find('.quality');
                const $image = $element.find('a.poster img');
                const $name = $element.find('a.name');
                var movie = {
                    quality:$quality.text(),
                    image: $image.attr('src'),
                    title: $name.text()
                }
                movies.push(movie);
            });
            return movies;
        });
}

module.exports = {
    getMovies
}

