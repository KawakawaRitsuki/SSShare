const db = require('mongoose'),
  config = require('config'),
  Schema = db.Schema

db.connect(`mongodb://${config.get('server.mongo')}/ssshare`, { useNewUrlParser: true })
const autoinc = require('mongoose-sequence')(db)

const UserSchema = new Schema({
  username: String,
  email: String,
  password: String,
  confirm_token: String,
  id: Number
})

UserSchema.plugin(autoinc, { inc_field: 'id'})
const User = db.model('User',UserSchema)

module.exports.db = db
module.exports.User = User
