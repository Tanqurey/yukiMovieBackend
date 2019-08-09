const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  getSuccessBody,
  sendFailBody,
  USEFUL_FLAG,
  USELESS_FLAG,
  ERR_CATE
} = require('../config/config')
const {
  compareHot
} = require('../api/kit')

let router = new Router()

router.post('/new', async ctx => {
  const Comment = mongoose.model('Comment')
  const UserComment = mongoose.model('UserComment')
  const MovieComment = mongoose.model('MovieComment')

  let comment = ctx.request.body.params.comment
  let userName = ctx.request.body.params.userName
  let movieInfo = ctx.request.body.params.movieInfo
  let createTime = Date.now()

  let newComment = new Comment({
    userName: userName,
    commentTitle: comment.commentTitle,
    commentContent: comment.commentContent,
    rating: comment.rating,
    movieInfo: movieInfo,
    createTime: createTime
  })
  await newComment.save().catch(err => {
    sendFailBody(ctx.body, err)
  })

  await MovieComment.findOne({
    movieInfo: movieInfo
  }).then(async res => {
    if (!res) {
      let movieComment = new MovieComment({
        movieInfo: movieInfo,
        commentCount: 1,
        commentList: [{
          createTime: createTime,
          commentTitle: comment.commentTitle,
          commentContent: comment.commentContent,
          rating: comment.rating,
          userName: userName,
        }]
      })
      await movieComment.save().catch(err => {
        sendFailBody(ctx.body, err)
      })
    } else {
      comment.userName = userName
      comment.createTime = createTime
      await MovieComment.updateOne({
        movieInfo: movieInfo
      }, {
        $addToSet: {
          commentList: comment
        },
        $inc: {
          commentCount: 1
        }
      }).catch(err => {
        sendFailBody(ctx.body, err)
      })
    }
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

  comment.movieInfo = movieInfo
  comment.createTime = createTime
  await UserComment.updateOne({
    userName: userName
  }, {
    $addToSet: {
      commentList: comment
    },
    $inc: {
      commentCount: 1
    }
  }).then(res => {
    ctx.body = getSuccessBody()
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/load/movie/new', async ctx => {
  const MovieComment = mongoose.model('MovieComment')
  await MovieComment.findOne({
    movieInfo: JSON.parse(ctx.query.movieInfo)
  }).then(res => {
    const eachNum = 4
    const start = (ctx.query.page - 1) * eachNum
    let isEnd = false
    let commentData = []
    let resBody = getSuccessBody()
    if (res) {
      let commentList = res.commentList.reverse()
      if ((start + 1) * eachNum > commentList.length - 1) {
        commentData = commentList.slice(start)
        isEnd = true
      } else {
        commentData = commentList.slice(start, (start + 1) * eachNum)
      }
      resBody.isEnd = isEnd
    } else {
      resBody.isEnd = false
    }
    resBody.commentData = commentData
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/load/movie/hot', async ctx => {
  const MovieComment = mongoose.model('MovieComment')
  await MovieComment.findOne({
    movieInfo: JSON.parse(ctx.query.movieInfo)
  }).then(res => {
    const eachNum = 4
    const start = (ctx.query.page - 1) * eachNum
    let isEnd = false
    let commentData = []
    let resBody = getSuccessBody()
    if (res) {
      let commentList = res.commentList.reverse().sort(compareHot('usefulList', 'uselessList'))
      if ((start + 1) * eachNum > commentList.length - 1) {
        commentData = commentList.slice(start)
        isEnd = true
      } else {
        commentData = commentList.slice(start, (start + 1) * eachNum)
      }
      resBody.isEnd = isEnd
    } else {
      resBody.isEnd = false
    }
    resBody.commentData = commentData
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.post('/judge', async ctx => {
  const Comment = mongoose.model('Comment')
  const UserComment = mongoose.model('UserComment')
  const MovieComment = mongoose.model('MovieComment')

  const judgeFlag = ctx.request.body.params.judgeFlag
  const commentUser = ctx.request.body.params.commentUser
  let comment = ctx.request.body.params.comment

  if (judgeFlag === USEFUL_FLAG) {
    await Comment.updateOne({
      createTime: comment.createTime,
      userName: comment.userName
    }, {
      $addToSet: {
        usefulList: commentUser
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })
  } else {
    await Comment.updateOne({
      createTime: comment.createTime,
      userName: comment.userName
    }, {
      $addToSet: {
        uselessList: commentUser
      }
    }).catch(err => {
      sendFailBody(ctx.body, err)
    })
  }

  const list = judgeFlag === USEFUL_FLAG ? 'usefulList' : 'uselessList'

  await UserComment.findOne({
    userName: comment.userName
  }).then(async res => {
    if (res) {
      let commentList = res.commentList
      for (let i = 0; i < commentList.length; i++) {
        if (commentList[i].createTime == comment.createTime) {
          commentList[i][list].push(commentUser)
          break
        }
      }
      res.commentList = commentList
      await res.save().catch(err => {
        sendFailBody(ctx.body, err)
      })
    } else {
      sendFailBody(ctx.body, )
    }
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

  await MovieComment.findOne({
    movieInfo: comment.movieInfo
  }).then(async res => {
    if (res) {
      let commentList = res.commentList
      for (let i = 0; i < commentList.length; i++) {
        if (commentList[i].createTime == comment.createTime && commentList[i].userName === comment.userName) {
          commentList[i][list].push(commentUser)
          break
        }
      }
      res.commentList = commentList
      await res.save().then(() => {
        let resBody = getSuccessBody()
        resBody.judgeFlag = judgeFlag
        ctx.body = getSuccessBody()
      }).catch(err => {
        sendFailBody(ctx.body, err)
      })
    } else {
      sendFailBody(ctx.body, ERR_CATE)
    }
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/count', async ctx => {
  const comment = JSON.parse(ctx.query.comment)
  const Comment = mongoose.model('Comment')
  await Comment.findOne({
    userName: comment.userName,
    createTime: comment.createTime
  }).then(res => {
    if (res) {
      let resBody = getSuccessBody()
      resBody.usefulList = res.usefulList
      resBody.uselessList = res.uselessList
      ctx.body = resBody
    }
    sendFailBody(ctx.body, err)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })

})

router.get('/load/user', async ctx => {
  const UserComment = mongoose.model('UserComment')
  await UserComment.findOne({
    userName: ctx.query.userName
  }).then(res => {
    const eachNum = 4
    const start = (ctx.query.page - 1) * eachNum
    let isEnd = false
    let commentData = []
    let resBody = getSuccessBody()
    if (res) {
      let commentList = res.commentList.reverse()
      if ((start + 1) * eachNum > commentList.length - 1) {
        commentData = commentList.slice(start)
        isEnd = true
      } else {
        commentData = commentList.slice(start, (start + 1) * eachNum)
      }
      resBody.isEnd = isEnd
    } else {
      resBody.isEnd = false
    }
    resBody.commentData = commentData
    ctx.body = resBody
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})

router.get('/recommend', async ctx => {
  const Comment = mongoose.model('Comment')
  const eachNum = 4
  let start = (ctx.query.page - 1) * eachNum

  await Comment.find({}).sort({
    'createTime': -1
  }).skip(start).limit(eachNum).exec().then(res => {
    if (res) {
      let resBody = getSuccessBody()
      resBody.commentData = res
      ctx.body = resBody
    }
    sendFailBody(ctx.body, ERR_CATE.NOT_FOUND)
  }).catch(err => {
    sendFailBody(ctx.body, err)
  })
})
module.exports = router