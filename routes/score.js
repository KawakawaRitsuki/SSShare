const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  identicon = require('identicon'),
  fs = require('fs'),
  mail = require('../mail'),
  Analyzer = require('sus-analyzer'),
  db = require('../mongo').db,
  User = require('../mongo').User,
  Score = require('../mongo').Score

module.exports = passport => {
  router.post("/new", (req,res) => {
    if(req.user == null) res.redirect('/')

    let score = {
      sus: req.body.sus,
      youtube_link: req.body.yt,
      note: req.body.note,
      jacket: req.body.jacket,
      user_id: req.user.id
    }
    if(req.body.music_s != "") {
      let wave = {}
      wave.source = req.body.music_s
      wave.offset = req.body.music_o
      score.wave = wave
    }
    if(req.body.movie_s != "") {
      let movie = {}
      movie.source = req.body.movie_s
      movie.offset = req.body.movie_o
      score.movie = movie
    }

    new Score(score).save()
      .then(s => res.redirect("/score/" + s.score_id))
  })

  router.get("/:id", (req,res) => {
    Score.findOne({score_id:req.params.id})
      .then(score => {
        if(!score) return res.status(404).send('404 Not found')
        let meta = Analyzer.getMeta(score.sus)
        User.findOne({id: score.user_id})
          .then(user => res.render('score/show',{title: meta.TITLE + " | SSShare", score: score , score_user: user ,user: req.user}))
      })
  })


  return router
}

