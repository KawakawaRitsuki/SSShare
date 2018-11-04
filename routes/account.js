const router = require('express').Router(),
  bcrypt = require('bcrypt'),
  identicon = require('identicon'),
  fs = require('fs'),
  path = require('path'),
  jimp = require('jimp'),
  ObjectId = require('mongoose').Types.ObjectId,
  mail = require('../mail'),
  is = require('../is'),
  db = require('../mongo').db,
  User = require('../mongo').User

const saltRounds = 10

module.exports = passport => {
  router.get('/login',is.NotLoggedIn, (req,res) => res.render('account/login',{title: 'Login | SSShare'}))
  router.post('/login', is.NotLoggedIn, passport.authenticate('local', {failureRedirect: '/account/login?failed=1'}),(req,res) => res.redirect('/'))

  router.get('/new', is.NotLoggedIn, (req,res) => res.render('account/new',{title: 'New Account | SSShare'}))
  router.post('/new', is.NotLoggedIn, async (req,res) => {
    const user = await User.findOne({email: req.body.email})
    if(user && user.confirmed) return res.redirect('/account/new?error=1')

    if(user) {
      user.confirm_token = mail.new(req.body.email)
      await user.save()
    } else
      await new User({email: req.body.email, confirm_token: mail.new(req.body.email)}).save()

    res.redirect('/account/send')
  })

  router.get("/register", is.NotLoggedIn, async (req,res) => {
    if(!req.query.hasOwnProperty('token')) return res.redirect('/account/new')
    const user = await User.findOne({confirm_token: req.query.token})
    if(!user) return res.redirect('/account/new')
    res.render('account/register',{title: "New Account | SSShare", email: user.email, token: req.query.token})
  })

  router.post("/register", is.NotLoggedIn, async (req,res) => {
    const hash = await bcrypt.hash(req.body.password, saltRounds)
    const user = await User.findOne({confirm_token: req.body.token})

    user.username = req.body.username
    user.password = hash
    user.confirm_token = ""
    user.confirmed = true

    const user_saved = await user.save()
    identicon.generate({ id: user_saved._id.toString(), size: 400 }, (err, buf) => fs.writeFileSync(`./icons/${user_saved._id}.png`, buf))
    res.redirect('/account/registered')
  })

  router.get("/registered",            (req,res) => res.render('message',{title: "Registered | SSShare", message: "アカウントの登録が完了しました。ログインしてください。"}))
  router.get("/send",                  (req,res) => res.render('message',{title: "Mail Send | SSShare", message: "メールを送信しました。受信トレイを確認してください。" , user: req.user}))
  router.get("/icon/:id",              (req,res) => res.sendFile('/icons/' + req.params.id + '.png', { root: './' }))

  router.get('/settings', is.LoggedIn, (req,res) => res.render('account/settings',{title: "Settings | SSShare", user: req.user}))
  router.post('/settings', is.LoggedIn, async (req,res) => {
    if(req.hasOwnProperty('files') && req.files.hasOwnProperty('avater')) {
      const image = await jimp.read(req.files.avater.data)
      image.cover(400, 400)
      await image.writeAsync(`./icons/${req.user._id.toString()}.png`)
    }

    const user = await User.findOne({id: req.user.id})

    if(req.body.hasOwnProperty('username')) user.username    = req.body.username
    if(req.body.hasOwnProperty('bio'))      user.bio         = req.body.bio
    if(req.body.hasOwnProperty('twitter'))  user.sns.twitter = req.body.twitter
    if(req.body.hasOwnProperty('github'))   user.sns.github  = req.body.github
    if(req.body.hasOwnProperty('youtube'))  user.sns.youtube = req.body.youtube

    user.markModified('sns')
    await user.save()

    res.redirect('/account/settings')
  })

  async function updateSNS(u, target, account) {
    const user = await User.findOne({id: u.id})
    user.sns[target] = account
    user.markModified('sns')
    await user.save()
  }

  router.get("/reset", (req,res) => {
    if(!req.query.hasOwnProperty('token')) return res.render('account/reset',{title: "Reset | SSShare"})
    res.render('account/password',{title: "Password Reset | SSShare", user: req.user})
  })

  router.post("/resetpw", async (req,res) => {
    const user = await User.findOne({id: req.user.id})
    const hash = await bcrypt.hash(req.body.password, saltRounds)
    user.password = hash
    await user.save()

    req.session.destroy()
    res.render('message',{title: "Password Reset | SSShare",message:"パスワードのリセットが完了しました。ログインしてください。"})
  })

  router.post("/reset", async (req,res) => {
    const user = req.body.hasOwnProperty('loggedin') && req.body.loggedin == "true" ? await User.findOne({id: req.user.id}) : await User.findOne({email: req.body.email})
    if(user == null) return res.redirect('/account/send')
    user.confirm_token = mail.reset(user.email)
    await user.save()
    res.redirect('/account/send')
  })

  router.post("/change", async (req,res) => {
    const user = await User.findOne({id: req.user.id})
    user.new_email = req.body.email
    user.confirm_token = mail.change(req.body.email)
    await user.save()
    res.render('message',{title: "Mail Send | SSShare", message: "メールを送信しました。受信トレイを確認してください。" , user: req.user})
  })

  router.get("/change", async (req,res) => {
    const user = await User.findOne({id: req.user.id})
    user.email = user.new_email
    user.new_email = ""
    await user.save()
    res.render('message',{title: "Mail Send | SSShare", message: "メールアドレスの変更が完了しました。" , user: req.user})
  })

  router.get("/logout", is.LoggedIn, (req,res) => {
    req.session.destroy()
    res.redirect('/')
  })

  return router
}
