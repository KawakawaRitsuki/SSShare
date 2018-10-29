const
  router = require('express').Router(),
  db = require('../mongo').db,
  User = require('../mongo').User

module.exports = () => {
  router.get("/", (req,res) => {
    if(!req.session.hasOwnProperty('passport')) return res.render('index',{title: "TopPage | SSShare"})
    User.findOne({_id:req.session.passport.user}).then(user => res.render('index',{title: "TopPage | SSShare",user: user}))
  })

  return router
}
