const db = require('mongoose'),
  config = require('config'),
  Schema = db.Schema

module.exports = (req,res,next) => {
  if(req.user == null) res.status(403).render('error/403')
  next()
}
