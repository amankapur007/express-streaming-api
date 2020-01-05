const configApi = require('../config')
const trakt = configApi.getTrakt();
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const TorrentSearchApi = require('torrent-search-api');

TorrentSearchApi.getProviders().forEach((i)=>{
    if(i!=undefined){
        try{
        TorrentSearchApi.enableProvider(i.name);
        }catch(error){
            console.error(error.toString())       
        }
    }
})

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


async function getLinks(query){
 
// Search '1080' in 'Movies' category and limit to 20 results
const torrents = await TorrentSearchApi.search(query, 'Movies');console.log(torrents);
    return torrents.filter((torrent)=>{return torrent.magnet!=null && torrent.magnet!=undefined});
}

async function getUrlLinks(query){
    var urls = [];
    var url = `https://thepiratebays.info/search/${query}/1/7/201`
    return await fetch(url).then((response)=>{
        return response.text();
      })
      .then((body)=>{
        var $ = cheerio.load(body);
        $('#searchResult tbody tr').each(function(i, element){
            $element = $(element);
            var $title = $element.find('td>div.detName');
            var margnetLink = $element.find('td>a');
            var size = $element.find('td>font.detDesc')
            var $seeds = $($element.find('td')[2]);
            if(margnetLink.length>=1){
                var $magnetLink  = $(margnetLink[0]);
                var link = $magnetLink.attr('href')
                if(link.toLowerCase().startsWith('magnet') && link.split(':btih:')[1]!=undefined && link.split(':btih:')[1].split('&')[0]!=undefined){
                urlObj = {
                    title:$title ?$title.text().trim():'',
                    margnetLink: link,
                    size:(size?size.text().trim().split(',')[1]:'Size -').trim(),
                    seeds:$seeds?parseInt($seeds.text()):0
                }
                urls.push(urlObj)
            }
            }else{

            }

        });
        return urls;
      });
}

module.exports = {
    getMovieById,
    getUrlLinks,
    getLinks
}