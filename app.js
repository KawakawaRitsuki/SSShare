const express = require('express'),
  session = require('express-session'),
  fileUpload = require('express-fileupload'),
  ConnectMongo = require('connect-mongo')(session),
  fs = require('fs'),
  config = require('config'),
  bodyparser = require('body-parser'),
  db = require('./mongo').db,
  User = require('./mongo').User

const app = express()
const mongoUrl = config.get('server.mongo')
const passport = require('./passport')

const sessionMiddleware = session({
  store: new ConnectMongo({
    db: 'session',
    host: mongoUrl,
    port: '27017',
    url: `mongodb://${mongoUrl}/ssshare`
  }),
  secret: 'ssshare',
  resave: false,
  saveUninitialized: false
})

app.disable('x-powered-by')
app.use(sessionMiddleware)
app.use(bodyparser.urlencoded({ limit:'100mb',extended: true }))
app.use(bodyparser.json({limit:'100mb'}))
app.use(fileUpload({
  limits: { fileSize: 8 * 1024 * 1024 }
}))
app.use(express.static('./public'))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'pug')
app.locals.basedir = './views'

app.use(async (req, res, next) => {
  if(req.session.hasOwnProperty('passport') && req.session.passport.hasOwnProperty('user')) {
    const user = await User.findOne({_id:req.session.passport.user})
    if(!user) {req.user = null; next()}
    delete user._doc.password
    delete user._doc.email
    delete user._doc.confirm_token
    req.user = user
  } else {
    req.user = null
  }
  next()
})

const server = app.listen(config.get("server.port") || 3000, () => console.log('PORT: ' + server.address().port))

app.use("/",require('./routes/root')())
app.use("/account",require('./routes/account')(passport))
app.use("/score",require('./routes/score')())
app.use("/user",require('./routes/user')())
