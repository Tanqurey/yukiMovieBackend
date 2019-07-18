const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  noticeMsg
} = require('../config/config')

let router = new Router()

router.get('/', async (ctx) => {
  ctx.body = "页面不存在"
})

router.get('/checkName', async (ctx) => {
  const User = mongoose.model('User')
  let userInput = ctx.query.userName
  await User.findOne({
    userName: userInput
  }).exec().then(res => {
    if (res) {
      ctx.body = {
        code: 200,
        msg: noticeMsg.successMsg,
        isExisted: true
      }
      return
    }
    ctx.body = {
      code: 200,
      msg: noticeMsg.successMsg,
      isExisted: false
    }
  }).catch(err => {
    ctx.body = {
      code: 500,
      msg: noticeMsg.failMsg + err
    }
  })
})

router.post('/register', async (ctx) => {
  // 用户注册业务逻辑
  const User = mongoose.model('User')
  let newUser = new User(ctx.request.body.params)
  await newUser.save().then(() => {
    ctx.body = {
      code: 200,
      msg: noticeMsg.successMsg
    }
  }).catch(err => {
    ctx.body = {
      code: 500,
      msg: noticeMsg.failMsg + err
    }
  })
})

router.post('/login', async (ctx) => {
  const User = mongoose.model('User')

  let loginUser = ctx.request.body.params
  let userName = loginUser.userName
  let password = loginUser.password

  await User.findOne({
    userName: userName
  }).exec().then(async (res) => {
    if (res) {
      //进行密码的比对
      let tempUser = new User()
      await tempUser.comparePassword(password, res.password).then(isMatch => {
        ctx.body = {
          code: 200,
          msg: noticeMsg.successMsg,
          isMatch: isMatch
        }
      }).catch(err => {
        ctx.body = {
          code: 500,
          msg: noticeMsg.failMsg + err
        }
      })
    } else {
      ctx.body = {
        code: 200,
        msg: noticeMsg.successMsg,
        isMatch: false
      }
    }
  }).catch(err => {
    ctx.body = {
      code: 500,
      msg: noticeMsg.failMsg + err
    }
  })
})

router.get('/secureQuestion', async (ctx) => {
  const User = mongoose.model('User')
  let userInput = ctx.query.userName
  await User.findOne({
    userName: userInput
  }).exec().then(res => {
    if (res) {
      ctx.body = {
        code: 200,
        msg: noticeMsg.successMsg,
        isExisted: true,
        secureQuestion: res.secureQuestion
      }
      return
    }
    ctx.body = {
      code: 200,
      msg: noticeMsg.successMsg,
      isExisted: false
    }
  }).catch(err => {
    ctx.body = {
      code: 500,
      msg: noticeMsg.failMsg + err
    }
  })
})

module.exports = router