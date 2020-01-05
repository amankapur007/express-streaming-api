var express = require('express')
var router = express.Router();
var movies = require('./movies.service')

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    next()
  })
  
router.get("/:id", async function (req, res) {
    var moviesList = await movies.getMovieById(req.params.id,req.query);
    res.status(200).json(moviesList)
})

router.get("/urls/:query",async function (req, res) {
  var moviesList = await movies.getUrlLinks(req.params.query);
  res.status(200).json(moviesList)
})

module.exports = router
