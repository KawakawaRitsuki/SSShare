const db = require('mongoose'),
  config = require('config'),
  Schema = db.Schema

db.connect(`mongodb://${config.get('server.mongo')}/ssshare`, { useNewUrlParser: true })

const User = db.model('User', {
  name: String,
  email: String,
  password: String,
  iconPath: String,
  confirm_token: String,
  isConfirmed: Boolean
})

module.exports.db = db
module.exports.User = User
