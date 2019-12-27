const express = require('express');
fs = require('fs')
var webtorrent = require('webtorrent');
const movieService = require('./search_movie');
const moviefService = require('./f_movie');
const stream = require('./torrent');

const app = express();

app.get('/', (req, res) => {
    res.json({
        'message': 'Its working'
    });
});

//search/{title}
app.get('/search/:title', (req, res) => {
    movieService.searchMovies(req.params.title)
        .then((movies) => {
            res.json(movies);
        })
});

//movie/{id}
app.get('/movie/:id', (req, res) => {
    movieService.getMovie(req.params.id)
        .then((data) => {
            res.json(data);
        })
});

//fmovie
app.get('/fmovie', (req, res) => {
    moviefService.getMovies(req.query.page)
        .then((data) => {
            res.json(data);
        })
});

var client = new webtorrent();

var getLargestFile = function (torrent) {
    var file;
    for (i = 0; i < torrent.files.length; i++) {
        if (torrent.files[i].name.endsWith('.mp4') || !file || file.length < torrent.files[i].length) {
            file = torrent.files[i];
        }
    }
    return file;
};

var buildMagnetURI = function (infoHash) {
    return 'magnet:?xt=urn:btih:' + infoHash + '&tr=udp%3A%2F%2Ftracker.publicbt.com%3A80&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.ccc.de%3A80&tr=udp%3A%2F%2Ftracker.istole.it%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969';
};

app.get('/streaming/:infoHash.mp4', async (req, res) => {
    var promise = new Promise((resolve, reject) => {
        var torrentId = buildMagnetURI(req.params.infoHash.replace(".mp4", ""));
        var torrent = client.get(torrentId);
        if(torrent!=null){
            return resolve(torrent);
        }else{
        client.add(torrentId, (torrent) => {
            return resolve(torrent);
        });
    }
    });
    promise.then((data) => {
        if (data) {
            streaming(req, res, data);
        } else {
            res.status(500).send(500)
        }
    }).catch((error) => {
        console.error(error.toString());
        res.status(401).send('Error!');
    });    
});

function streaming(req, res, torrent){
    try {
        var torrent = torrent;
        var file = getLargestFile(torrent);
        var total = file.length;

        if (typeof req.headers.range != 'undefined') {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];
            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total - 1;
            var chunksize = (end - start) + 1;
        } else {
            var start = 0; var end = total;
            var chunksize = (end - start) + 1;
        }

        var stream = file.createReadStream({ start: start, end: end });
        res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        stream.pipe(res);
    } catch (err) {
        res.status(500).send('Error: ' + err.toString());
    }
}

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
const port = process.env.port || 3000;
app.listen(server_port, function () {
    console.log("Listening on 123", server_port)
});
