const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  bcrypt = require('bcrypt'),
  db = require('./mongo').db,
  User = require('./mongo').User

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false
  }, (req, email, password, done) => {
    User.findOne({email: email})
      .then(doc => {
        if(!doc) return done(null, false)
        bcrypt.compare(password, doc.password).then(res => {done(null, res ? doc : false)})
      })
      .catch(err => console.log(err))
  })
)

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser((id, done) => User.findOne({_id: id}).then(user => done(null, user)).catch(e => done(e)))

module.exports = passport
