const express = require('express'),
  session = require('express-session'),
  ConnectMongo = require('connect-mongo')(session),
  fs = require('fs'),
  config = require('config'),
  bodyparser = require('body-parser')

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
app.use(express.static('./public'))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'pug')
app.locals.basedir = './views'

const server = app.listen(config.get("server.port") || 3000, () => {
  console.log('PORT: ' + server.address().port)
})

const root = require('./routes/root')(),
  account = require('./routes/account')(passport)

app.use("/",root)
app.use("/account",account)
