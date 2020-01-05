const express = require('express');
fs = require('fs')
var webtorrent = require('webtorrent');
const movieService = require('./search_movie');
const moviefService = require('./f_movie');
const trendingApi = require('./trending');
const popularApi = require('./popular');
const movie = require('./movies/movie');
const bodyParser = require('body-parser');
var rimraf = require("rimraf");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.json({
        'message': 'Its working'
    });
});

//search/{title}
app.get('/search', (req, res) => {
    movieService.searchMovies(req.query.q)
        .then((movies) => {
            res.json(movies);
        })
});

//movie/{id}
app.get('/movie', (req, res) => {
    movieService.getMovie(req.query.id)
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


app.get('/top10',(req, res)=>{
    movieService.top10Movie()
    .then((data) => {
        res.status(200).json(data);
    });
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

var formURI = function(xt,dn,tr){
    var magnetLink = 'magnet:?xt='+xt+"&dn="+dn;
    for(var i = 0;i<tr.length;i++){
        magnetLink = magnetLink+"&tr="+tr[i]
    }
    console.info("URI Formed : "+encodeURI(magnetLink));
    return encodeURI(magnetLink);
}
app.get('/streaming/:data', async (req, res) => {
    var promise = new Promise((resolve, reject) => {
        if(req.query.magnet!=null || req.query.magnet!=undefined){
            var xt = req.query.xt;
             var dn = req.query.dn;
            var tr = req.query.tr;
            var torrentId =  formURI(xt,dn,tr);
        }else{
            var torrentId = buildMagnetURI(req.query.hash.replace(".mp4", ""));
        }
        console.info(torrentId)
       
        var torrent = client.get(torrentId);
        
        if (torrent != null) {
            console.info("Torrent ready :: ",torrent.ready)
                if(torrent.ready){
                return resolve({ 'torrent': torrent, 'alreadyFound': true });                    
                }
        } else {
            client.add(torrentId, "\\user",(torrent) => {
                console.info(new Date() + " :: Torrent added - ",torrentId);
                return resolve({ 'torrent': torrent, 'alreadyFound': true });
            });
        }
    });
    promise.then((data) => {
        if (data) {
            if(data.alreadyFound){
                console.info(new Date() + " :: Streaming ... ")
            }
            streaming(req, res, data);
        } else {
            res.status(500).send(500);
            res.end();
        }
    }).catch((error) => {
        console.error(new Date() + " :: Error Occured , msg = " + error.toString());
        res.status(401).send('Error!');
        res.end();
    });
});


function streaming(req, res, data) {
    var torrent = null;
    try {
        torrent = data.torrent;
        var file = getLargestFile(torrent);
        var total = file.length;
        req.header("Range","bytes=1-999");
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
        res.on('close', () => {
            var dir = torrent.path;
            rimraf(dir, function () { console.log("deleted ", dir); });
            if (data.alreadyFound == true) {
                //torrent.destroy(()=>{
                  //  console.info(new Date()+" :: Torrent destroyed");
                //});
                //console.log(new Date() + " :: Clossing the active request for streaming");
            }
            res.end();
        });

    } catch (err) {
        console.error(new Date()+" :: Error ", err.toString());
        var dir = torrent.path;
        rimraf(dir, function () { console.log("deleted ", dir); });
        try{
        torrent.destroy(()=>{
             console.info(new Date()+" :: Torrent destroyed");
        });
         }catch(err){
        console.log(err.toString())
        }
        res.status(500).send('Error: ' + err.toString());
        res.end();
    }
}

app.get('/trending',(req, res)=>{
    trendingApi.trending(req.query.page,req.query.limit).then((data)=>{
        res.status(200).json(data)
    }).catch((error)=>{
        console.error(new Date()+" :: msg ",error.toString());
        res.status(500).send(error.toString);
    })
})

app.get('/popular',(req, res)=>{
    popularApi.popular(req.query.page,req.query.limit).then((data)=>{
        res.status(200).json(data)
    }).catch((error)=>{
        console.error(new Date()+" :: msg ",error.toString());
        res.status(500).send(error.toString);
    })
})

app.use("/movie",movie);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
console.log(process.env.CLIENT_ID);
const port = process.env.port || 3000;
app.listen(server_port, function () {
    console.info(new Date()+" :: Listening on ", server_port)
});
