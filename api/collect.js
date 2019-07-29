const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  successBody,
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
        await Collection.update({
          collectionOwner: data.userName
        }, {
          $inc: {
            collectionCount: 1
          },
          $addToSet: {
            collectionList: newRecord
          }
        }).then(res => {
          ctx.body = successBody
        }).catch(err => {
          sendFailBody(ctx.body, err)
        })
      }
      ctx.body = successBody
    }
    sendFailBody(ctx.body, '未找到相应的记录')
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

module.exports = router