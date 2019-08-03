const Router = require('koa-router')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10
const UserInfo = require('../config/UserInfo')

const {
  successBody,
  sendFailBody
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
    let resBody = successBody
    if (res) {
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

router.post('/register', async (ctx) => {
  // 用户注册业务逻辑
  const User = mongoose.model('User')
  const Collection = mongoose.model('Collection')
  const UserComment = mongoose.model('UserComment')

  let newUser = new User(ctx.request.body.params)
  await newUser.save().catch(err => {
    sendFailBody(ctx.body, err)
  })

  let newCollection = new Collection({
    collectionOwner: ctx.request.body.params.userName
  })
  await newCollection.save().catch(err => {
    sendFailBody(ctx.body, err)
  })

  let newUserComment = new UserComment({
    userName: ctx.request.body.params.userName
  })
  await newUserComment.save().then(() => {
    ctx.body = successBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.post('/login', async (ctx) => {
  let loginUser = ctx.request.body.params
  let userName = loginUser.userName
  let password = loginUser.password
  let isQuickLogin = loginUser.isQuickLogin
  const User = mongoose.model('User')

  await User.findOne({
    userName: userName
  }).exec().then(async (findRes) => {
    if (findRes) {
      if (isQuickLogin) {
        // 快速登入
        await User.updateOne({
          userName: userName
        }, {
          lastLoginTime: Date.now()
        }).then(res => {
          let resBody = successBody
          resBody.isMatch = true
          resBody.currentUser = new UserInfo(findRes)
          ctx.body = resBody
        }).catch(err => {
          sendFailBody(ctx.body, err)
        })
      }
      //进行密码的比对
      let tempUser = new User()
      await tempUser.comparePwdOrAns(password, findRes.password).then(async isMatch => {
        if (isMatch) {
          await User.updateOne({
            userName: userName
          }, {
            lastLoginTime: Date.now()
          }).then(res => {
            let resBody = successBody
            resBody.isMatch = isMatch
            resBody.currentUser = new UserInfo(findRes)
            ctx.body = resBody
          }).catch(err => {
            sendFailBody(ctx.body, err)
          })
        } else {
          let resBody = successBody
          resBody.isMatch = isMatch
          ctx.body = resBody
        }
      }).catch(err => {
        sendFailBody(ctx.body, err)
      })
    } else {
      let resBody = successBody
      resBody.isMatch = false
      if (isQuickLogin) {
        resBody.currentUser = null
      }
      ctx.body = resBody
    }
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/secureQuestion', async (ctx) => {
  let userInput = ctx.query.userName
  const User = mongoose.model('User')

  await User.findOne({
    userName: userInput
  }).exec().then(res => {
    let resBody = successBody
    if (res) {
      resBody.isExisted = true
      resBody.secureQuestion = res.secureQuestion
      ctx.body = resBody
      return
    }
    resBody.isExisted = false
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

//密保回答校验
router.post('/checkAnswer', async (ctx) => {
  let userName = ctx.request.body.params.userName
  let userAnswer = ctx.request.body.params.secureAnswer
  const User = mongoose.model('User')


  await User.findOne({
    userName: userName
  }).exec().then(async res => {
    let tempUser = new User()
    await tempUser.comparePwdOrAns(userAnswer, res.secureAnswer).then(isMatch => {
      let resBody = successBody
      resBody.isMatch = isMatch
      ctx.body = resBody
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

//密码重置
router.post('/resetPassword', async (ctx) => {
  const User = mongoose.model('User')
  let userName = ctx.request.body.params.userName
  let newPassword = ctx.request.body.params.newPassword

  const hash = await new Promise((res, rej) => {
    //新密码加盐加密
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) {
        rej('')
      }
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) {
          rej('')
        }
        res(hash)
      })
    })
  })
  if (!hash) {
    sendFailBody(ctx.body, '哈希加密出错')
  }
  newPassword = hash
  await User.updateOne({
    userName: userName
  }, {
    password: newPassword
  }).then(async res => {
    ctx.body = successBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

module.exports = router