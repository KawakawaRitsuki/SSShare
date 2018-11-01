const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  identicon = require('identicon'),
  fs = require('fs'),
  path = require('path'),
  jimp = require('jimp'),
  ObjectId = require('mongoose').Types.ObjectId,
  mail = require('../mail'),
  isLoggedIn = require('../isLoggedIn'),
  db = require('../mongo').db,
  User = require('../mongo').User

const saltRounds = 10

module.exports = passport => {
  router.get("/login", (req,res) => {
    res.render('account/login',{title: "Login | SSShare"})
  })

  router.post("/login",passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/account/login?failed=1'
  }))

  router.get("/new", (req,res) => {
    res.render('account/new',{title: "New Account | SSShare"})
  })

  router.post("/new", (req,res) => {
    User.findOne({email: req.body.email})
      .then(doc => {
        if(doc && doc.confirm_token == "") return res.redirect('/account/new?error=0')
        new User({
          email: req.body.email,
          confirm_token: mail.new(req.body.email)}
        ).save().then(() => res.redirect('/account/send'))
      })
  })

  router.get("/register", (req,res) => {
    if(!req.query.hasOwnProperty('token')) return res.redirect('/account/new')

    User.findOne({confirm_token: req.query.token})
      .then(doc => {
        if(!doc) return res.redirect('/account/new',)
        res.render('account/register',{title: "New Account | SSShare",email: doc.email,token: req.query.token})
      }).catch(err => {
        res.redirect('/account/new')
      })
  })

  router.post("/register", (req,res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      User.findOne({confirm_token: req.body.token})
        .then(doc => {
          doc.username = req.body.username
          doc.password = hash
          doc.confirm_token = ""
          doc.save().then(doc => {
            identicon.generate({ id: doc._id.toString(), size: 400 }, (err, buf) => fs.writeFileSync(`./icons/${doc._id}.png`, buf))
            res.redirect('/account/registered')
          })
        })
    })
  })

  router.get("/registered", (req,res) => {
    res.render('account/registered',{title: "Registered | SSShare"})
  })

  router.get("/send", (req,res) => {
    res.render('account/mail-send',{title: "Mail Send | SSShare"})
  })

  router.get("/icon/:id", (req,res) => {
    res.sendFile('/icons/' + req.params.id + '.png', { root: './' })
  })

  router.get('/settings', isLoggedIn, (req,res) => {
    console.log(req.user)
    res.render('account/settings',{title: "Settings | SSShare", user: req.user})
  })

  router.post('/settings', isLoggedIn, async (req,res) => {
    if(req.hasOwnProperty('files') && req.files.hasOwnProperty('avater')) {
      const image = await jimp.read(req.files.avater.data)
      image.cover(400, 400)
      await image.writeAsync(`./icons/${req.user._id.toString()}.png`)
    }
    if(req.body.hasOwnProperty('twitter')) await updateSNS(req.user, 'twitter', req.body.twitter)
    if(req.body.hasOwnProperty('github')) await updateSNS(req.user, 'github', req.body.github)
    if(req.body.hasOwnProperty('youtube')) await updateSNS(req.user, 'youtube', req.body.github)
    res.redirect('/account/settings')
  })

  async function updateSNS(user, target, account) {
    user.sns[target] = account
    user.markModified('sns')
    await user.save()
  }

  router.get("/logout", isLoggedIn, (req,res) => {
    req.session.destroy()
    res.redirect('/')
  })

  return router
}

// ユーザー名は重複可
// TODO: スクリーンネーム重複チェック
// TODO: ログイン直後Upload消えてない？
