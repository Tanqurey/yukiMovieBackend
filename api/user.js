const Router = require('koa-router')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10
const UserInfo = require('../config/UserInfo')
const Guest = require('../config/guest')

const {
  getSuccessBody,
  sendFailBody,
  ERR_CATE,
  COUNT_CATE,
  COUNT_HANDLE,
  levelExp,
  MAX_LEVEL
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
    let resBody = getSuccessBody()
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
    ctx.body = getSuccessBody()
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
  const thisLoginTime = Date.now()

  await User.findOneAndUpdate({
    userName: userName
  }).exec().then(async (findRes) => {
    if (findRes) {
      if (thisLoginTime - findRes.lastLoginTime >= 86400000) {
        await User.updateOne({
          userName: userName
        }, {
          $inc: {
            exp: 1
          }
        }, {
          new: true
        }).then(async res => {
          let nowLevel = res.level
          if (nowLevel === MAX_LEVEL) return
          let nextLevel = nowLevel + 1
          if (res.exp >= levelExp['LEVEL_' + nextLevel + '_EXP']) {
            await User.update({
              userName: userName
            }, {
              $inc: {
                level: 1
              }
            }).catch(err => {
              sendFailBody(ctx.body, err)
            })
          }
        }).catch(err => {
          sendFailBody(ctx.bogdy, err)
        })
      }
      if (isQuickLogin) {
        // 快速登入
        await User.updateOne({
          userName: userName
        }, {
          lastLoginTime: thisLoginTime
        }).then(() => {
          let resBody = getSuccessBody()
          resBody.isMatch = true
          resBody.currentUser = new UserInfo(findRes)
          ctx.body = resBody
        }).catch(err => {
          sendFailBody(ctx.body, err)
        })
      } else {
        let tempUser = new User()
        await tempUser.comparePwdOrAns(password, findRes.password).then(async isMatch => {
          if (isMatch) {
            await User.updateOne({
              userName: userName
            }, {
              lastLoginTime: Date.now()
            }).then(res => {
              let resBody = getSuccessBody()
              resBody.isMatch = isMatch
              resBody.currentUser = new UserInfo(findRes)
              ctx.body = resBody
            }).catch(err => {
              sendFailBody(ctx.body, err)
            })
          } else {
            let resBody = getSuccessBody()
            resBody.isMatch = isMatch
            ctx.body = resBody
          }
        }).catch(err => {
          sendFailBody(ctx.body, err)
        })
      }
    } else {
      let resBody = getSuccessBody()
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
    let resBody = getSuccessBody()
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
      let resBody = getSuccessBody()
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
    ctx.body = getSuccessBody()
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.post('/changeCount', async ctx => {
  const User = mongoose.model('User')

  let params = ctx.request.body.params
  let user = params.user
  let guest = params.guest
  let handle = params.handle

  if (handle === COUNT_HANDLE.add) {
    await User.updateOne({
      userName: user
    }, {
      $addToSet: {
        subscribeList: guest
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })

    await User.updateOne({
      userName: guest
    }, {
      $addToSet: {
        fansList: user
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })
  } else {
    await User.updateOne({
      userName: user
    }, {
      $pull: {
        subscribeList: guest
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })

    await User.updateOne({
      userName: guest
    }, {
      $pull: {
        fansList: user
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })
  }

  let resBody = getSuccessBody()
  await User.findOne({
    userName: user
  }).then(res => {
    if (res) {
      resBody.currentUser = new UserInfo(res)
    }
    sendFailBody(ctx.body, ERR_CATE.NOT_FOUND)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

  await User.findOne({
    userName: guest
  }).then(res => {
    if (res) {
      resBody.guestData = new Guest(res)
      ctx.body = resBody
    }
    sendFailBody(ctx.body, ERR_CATE.NOT_FOUND)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

})

router.get('/count/load', async ctx => {
  let params = ctx.query
  const User = mongoose.model('User')

  await User.findOne({
    userName: params.userName
  }).then(res => {
    if (res) {
      let list = params.cate == COUNT_CATE.fans ? res.fansList : res.subscribeList
      const eachNum = 14
      const start = (params.page - 1) * eachNum
      let isEnd = false
      let listData = []
      if (res) {
        if ((start + 1) * eachNum > list.length - 1) {
          listData = list.slice(start)
          isEnd = true
        } else {
          listData = list.slice(start, (start + 1) * eachNum)
        }
        let resBody = getSuccessBody()
        resBody.listData = listData
        resBody.isEnd = isEnd
        ctx.body = resBody
      }
    }
    sendFailBody(ctx.body, ERR_CATE.NOT_FOUND)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.post('/modify/whatsup', async ctx => {
  const User = mongoose.model('User')
  let userName = ctx.request.body.params.userName
  let whatsUp = ctx.request.body.params.whatsUp

  await User.findOneAndUpdate({
    userName: userName
  }, {
    whatsUp: whatsUp
  }, {
    new: true
  }).then(res => {
    let resBody = getSuccessBody()
    resBody.currentUser = new UserInfo(res)
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

})
module.exports = router