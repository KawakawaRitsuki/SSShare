const router = require('express').Router(),
  Analyzer = require('sus-analyzer'),
  User = require('../mongo').User,
  Score = require('../mongo').Score

module.exports = passport => {

  router.get("/:id", async (req,res) => {
    const user = await User.findOne({id:req.params.id})
    if(!user) return res.status(404).send('404 Not found')
    user.scores = (await Score.find({user_id: req.params.id})).map(score => Analyzer.getMeta(score.sus))
    res.render('user/show',{title: user.username + " | SSShare", page_user: user, user: req.user})
  })

  return router
}

