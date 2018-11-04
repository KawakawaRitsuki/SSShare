const router = require('express').Router(),
  Analyzer = require('sus-analyzer'),
  { map } = require('p-iteration'),
  db = require('../mongo').db,
  User = require('../mongo').User,
  Score = require('../mongo').Score

module.exports = () => {
  router.get("/", (req,res) => res.render('index',{title: "TopPage | SSShare",user: req.user}))

  router.get('/list', async (req,res) => {
    let scores = await map((await Score.find()), async s => {
      s.meta = Analyzer.getMeta(s.sus)
      s.user = await User.findOne({id: s.user_id})
      return s
    })
    if(req.query.hasOwnProperty('q')) scores = scores.filter(s => s.meta.TITLE.toLowerCase().indexOf(req.query.q.toLowerCase()) != -1 || s.meta.ARTIST.toLowerCase().indexOf(req.query.q.toLowerCase()) != -1 || s.meta.DESIGNER.toLowerCase().indexOf(req.query.q.toLowerCase()) != -1)
    if(req.query.hasOwnProperty('s') && (req.query.s.slice(5) == 'asc' || req.query.s.slice(5) == 'desc')) {
      const isAsc = req.query.s.slice(5) == 'asc' ? true : false
      switch (req.query.s.slice(0,5)) {
        case 'level':
          scores = scores.sort((a,b) => {
            if(isAsc){
              if(a.meta.DIFFICULTY.LEVEL < b.meta.DIFFICULTY.LEVEL) return -1
              if(a.meta.DIFFICULTY.LEVEL > b.meta.DIFFICULTY.LEVEL) return 1
              if(a.meta.PLAYLEVEL.LEVEL < b.meta.PLAYLEVEL.LEVEL) return -1
              if(a.meta.PLAYLEVEL.LEVEL > b.meta.PLAYLEVEL.LEVEL) return 1
              if(a.meta.PLAYLEVEL.STAR < b.meta.PLAYLEVEL.STAR) return -1
              if(a.meta.PLAYLEVEL.STAR > b.meta.PLAYLEVEL.STAR) return 1
            } else {
              if(a.meta.DIFFICULTY.LEVEL > b.meta.DIFFICULTY.LEVEL) return -1
              if(a.meta.DIFFICULTY.LEVEL < b.meta.DIFFICULTY.LEVEL) return 1
              if(a.meta.PLAYLEVEL.LEVEL > b.meta.PLAYLEVEL.LEVEL) return -1
              if(a.meta.PLAYLEVEL.LEVEL < b.meta.PLAYLEVEL.LEVEL) return 1
            }
            return 0
          })
          break
      }
    }

    res.render('list', {user: req.user,query: req.query.q, scores: scores})
  })

  return router
}
