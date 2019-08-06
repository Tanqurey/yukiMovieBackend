const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  getSuccessBody,
  sendFailBody
} = require('../config/config')

let router = new Router()

router.post('/add', async (ctx) => {
  let data = ctx.request.body.params
  let newRecord = {}
  newRecord.title = data.title
  newRecord.id = data.id
  newRecord.directors = data.directors
  newRecord.collectTime = Date.now().toString()
  const Collection = mongoose.model('Collection')
  await Collection.findOne({
    collectionOwner: data.userName
  }).then(async res => {
    if (res) {
      let collectionList = res.collectionList
      const flag = collectionList.some((item) => {
        return item.id === newRecord.id
      })
      if (!flag) {
        await Collection.updateOne({
          collectionOwner: data.userName
        }, {
          $inc: {
            collectionCount: 1
          },
          $addToSet: {
            collectionList: newRecord
          }
        }).then(res => {
          ctx.body = getSuccessBody()
        }).catch(err => {
          sendFailBody(ctx.body, err)
        })
      }
      ctx.body = getSuccessBody()
    }
    sendFailBody(ctx.body, '未找到相应的记录')
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/checkCollected', async (ctx) => {
  const id = ctx.query.movieId
  const userName = ctx.query.userName
  const Collection = mongoose.model('Collection')

  await Collection.findOne({
    collectionOwner: userName
  }).exec().then(res => {
    if (res) {
      let collectionList = res.collectionList
      const flag = collectionList.some(item => {
        return item.id === id
      })
      let resBody = getSuccessBody()
      resBody.isCollected = flag
      ctx.body = resBody
    }
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.post('/remove', async ctx => {
  const Collection = mongoose.model('Collection')

  await Collection.updateOne({
    collectionOwner: ctx.request.body.params.userName
  }, {
    $pull: {
      collectionList: {
        id: ctx.request.body.params.movieId
      }
    },
    $inc: {
      collectionCount: -1
    }
  }).then(res => {
    ctx.body = getSuccessBody()
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/load', async ctx => {
  const Collection = mongoose.model('Collection')
  await Collection.findOne({
    collectionOwner: ctx.query.collectionOwner
  }).then(res => {
    const eachNum = 14
    const start = (ctx.query.page - 1) * eachNum
    let isEnd = false
    let collectionData = []
    if (res) {
      if ((start + 1) * eachNum > res.collectionList.length - 1) {
        collectionData = res.collectionList.slice(start)
        isEnd = true
      } else {
        collectionData = res.collectionList.slice(start, (start + 1) * eachNum)
      }
      let resBody = getSuccessBody()
      resBody.collectionData = collectionData
      resBody.isEnd = isEnd
      ctx.body = resBody
    }
    sendFailBody(ctx.body, err)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

module.exports = router