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
  }, async (req, email, password, done) => {
    const user = await User.findOne({email: email})
    if(!user) return done(null, false)
    if(!user.confirmed) return done(null, false)
    bcrypt.compare(password, user.password).then(res => done(null, res ? user : false))
  })
)

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser((id, done) => User.findOne({_id: id}).then(user => done(null, user)).catch(e => done(e)))

module.exports = passport
