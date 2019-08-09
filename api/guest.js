const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  getSuccessBody,
  sendFailBody,
  ERR_CATE
} = require('../config/config')
const Guest = require('../config/guest')

let router = new Router()

router.get('/get', async ctx => {
  let guestName = ctx.query.guestName
  const User = mongoose.model('User')

  await User.findOne({
    userName: guestName
  }).then(res => {
    if (res) {
      let resBody = getSuccessBody()
      resBody.guestData = new Guest(res)
      ctx.body = resBody
    }
    sendFailBody(ctx.body, ERR_CATE.NOT_FOUND)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

module.exports = router