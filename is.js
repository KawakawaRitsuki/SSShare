const db = require('mongoose'),
  config = require('config'),
  Schema = db.Schema

module.exports = {
  LoggedIn: (req,res,next) => {
    if(!req.user) res.status(403).render('error/403')
    next()
  },
  NotLoggedIn: (req,res,next) => {
    if(req.user) res.redirect('/')
    next()
  }
}
