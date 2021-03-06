const db = require('mongoose'),
  config = require('config'),
  Schema = db.Schema

db.connect(`mongodb://${config.get('server.mongo')}/ssshare`, { useNewUrlParser: true })
const autoinc = require('mongoose-sequence')(db)

const UserSchema = new Schema({
  username: String,
  email: String,
  new_email: String,
  password: String,
  confirm_token: String,
  confirmed: Boolean,
  id: Number,
  sns: { type: Schema.Types.Mixed, default: {} },
  bio: String,
  star: []
})

UserSchema.plugin(autoinc, { inc_field: 'id'})
const User = db.model('User',UserSchema)

const ScoreSchema = new Schema({
  sus: String,
  youtube_link: String,
  note: String,
  jacket_link: String,
  wave: [],
  movie: [],
  user_id: Number,
  score_id: Number
})

ScoreSchema.plugin(autoinc, { inc_field: 'score_id'})
const Score = db.model('Score',ScoreSchema)

module.exports.db = db
module.exports.User = User
module.exports.Score = Score
