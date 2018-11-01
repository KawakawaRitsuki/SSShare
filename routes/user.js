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

  router.get("/:id", (req,res) => {
    User.findOne({id:req.params.id})
      .then(user => {
        if(!user) return res.status(404).send('404 Not found')
        Score.find({user_id: req.params.id})
          .then(scores => scores.map(score => Analyzer.getMeta(score.sus)))
          .then(metas => res.render('user/show',{title: user.username + " | SSShare",page_user: user ,user: req.user,scores: metas}))
      })
  })


  return router
}

