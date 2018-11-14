const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  fs = require('fs'),
  mail = require('../mail'),
  Analyzer = require('sus-analyzer'),
  sus2image = require('sus-2-image'),
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

    new Score(score).save().then(s => {
      fs.mkdirSync(`score/${s.score_id}`)
      sus2image.getMeasures(req.body.sus)
        .then(images => {
          images.reverse().forEach((image,i) => {
            fs.writeFileSync(`score/${s.score_id}/${i}.png` , Buffer.from(image.split(',')[1], 'base64'))
          })
          res.redirect("/score/" + s.score_id)
        })
    })
  })

  router.get("/:id", async (req,res) => {
    const score = await Score.findOne({score_id:req.params.id})
    if(!score) return res.status(404).redirect("/score/" + req.params.id)
    score.meta = Analyzer.getMeta(score.sus)
    const user = await User.findOne({id: score.user_id})
    res.render('score/show',{title: score.meta.TITLE + " | SSShare", score: score , score_user: user ,user: req.user, measure: fs.readdirSync(`./score/${req.params.id}/`).length})
  })

  router.get("/download/:id", async (req,res) => {
    const score = await Score.findOne({score_id:req.params.id})
    if(!score) return res.status(404).render('error/score-404')
    if(req.user == null) res.redirect('/')
    const meta = Analyzer.getMeta(score.sus)

    res.setHeader('Content-Type','text/x-sus')
    res.setHeader('Content-disposition', 'attachment;filename*=UTF-8\'\'' + encodeURIComponent( meta.TITLE + '.sus' ))
    res.send(score.sus)
    res.status(200)
  })

  router.get("/delete/:id", async (req,res) => {
    const score = await Score.findOne({score_id:req.params.id})
    if(!score) return res.redirect('/')
    if(score.user_id !== req.user.id) res.redirect(`/score/${req.params.id}`)

    await Score.deleteOne({score_id:req.params.id})
    res.redirect(`/user/${req.user.id}`)
  })

  router.get("/image/:id/:measures",  (req,res) => {
    res.sendFile('/score/' + req.params.id + '/' + req.params.measures + '.png', { root: './' })
  })

  return router
}

