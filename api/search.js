const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  getSuccessBody,
  sendFailBody
} = require('../config/config')


let router = new Router()

router.get('/user', async (ctx) => {
  const User = mongoose.model('User')
  let userName = ctx.query.userName
  await User.find({
    userName: {
      $regex: eval(`/${userName}/`)
    }
  }, 'level lastLoginTime fansCount userName subscribeCount whatsUp isAdmin').sort({
    'fansCount': -1,
    'level': -1
  }).exec().then(res => {
    let resBody = getSuccessBody()
    if (res.length) {
      let searchResult = []
      res.forEach(item => {
        searchResult.push(item)
      })
      resBody.searchResult = searchResult
      resBody.isExisted = true
      ctx.body = resBody
      return
    }
    resBody.isExisted = false
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

module.exports = router