const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  identicon = require('identicon'),
  fs = require('fs'),
  mail = require('../mail'),
  db = require('../mongo').db,
  User = require('../mongo').User

const saltRounds = 10

module.exports = passport => {
  router.get("/login", (req,res) => {
    res.render('user/login',{title: "Login | SSShare"})
  })

  router.post("/login",passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/user/login?failed=1'
  }))

  router.get("/new", (req,res) => {
    res.render('user/new',{title: "New Account | SSShare"})
  })

  router.post("/new", (req,res) => {
    User.findOne({email: req.body.email})
      .then(doc => {
        if(doc) return res.redirect('/user/new?error=0')
        new User({
          email: req.body.email,
          confirm_token: mail.new(req.body.email),
          isConfirmed: false}
        ).save().then(() => res.redirect('/user/send'))
      })
  })

  router.get("/register", (req,res) => {
    if(!req.query.hasOwnProperty('token')) return res.redirect('/user/new')

    User.findOne({confirm_token: req.query.token})
      .then(doc => {
        if(!doc) return res.redirect('/user/new',)
        res.render('user/register',{title: "New Account | SSShare",email: doc.email,token: req.query.token})
      }).catch(err => {
        res.redirect('/user/new',)
      })
  })

  router.post("/register", (req,res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      identicon.generate({ id: req.body.screen_name, size: 400 }, function(err, buffer) {
        fs.writeFileSync(`./icons/${req.body.screen_name}.png`, buffer)
        User.findOne({confirm_token: req.body.token})
          .then(doc => {
            console.log(doc)
            doc.isConfirmed = true
            doc.username = req.body.username
            doc.screen_name = req.body.screenname
            doc.password = hash
            doc.confirm_token = ""
            doc.save().then(() => res.redirect('/user/registered'))
          })
      });
    });
  })

  router.get("/registered", (req,res) => {
    res.render('user/registered',{title: "Registered | SSShare"})
  })

  router.get("/send", (req,res) => {
    res.render('user/mail-send',{title: "Mail Send | SSShare"})
  })

  return router
}

// ユーザー名は重複可
// TODO: スクリーンネーム重複チェック
