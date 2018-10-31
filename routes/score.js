const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  identicon = require('identicon'),
  fs = require('fs'),
  mail = require('../mail'),
  db = require('../mongo').db,
  User = require('../mongo').User

module.exports = passport => {
  router.post("/new", (req,res) => {
    console.log(req.body)
    res.render('score/new',{title: "Upload | SSShare", sus: req.body.sus, yt: req.body.yt ,note: req.body.note,user: req.user})
  })

  return router
}

