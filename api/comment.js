const Router = require('koa-router')
const mongoose = require('mongoose')
const {
  successBody,
  sendFailBody
} = require('../config/config')

let router = new Router()

router.post('/new', async ctx => {
  const Comment = mongoose.model('Comment')
  const UserComment = mongoose.model('UserComment')
  const MovieComment = mongoose.model('MovieComment')

  let comment = ctx.request.body.params.comment
  let userName = ctx.request.body.params.userName
  let movieInfo = ctx.request.body.params.movieInfo

  let newComment = new Comment({
    userName: userName,
    commentTitle: comment.commentTitle,
    commentContent: comment.commentContent,
    rating: comment.rating,
    movieInfo: movieInfo
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
        commentList: [{
          createTime: Date.now(),
          commentTitle: comment.commentTitle,
          commentContent: comment.commentContent,
          rating: comment.rating,
          userName: userName
        }]
      })
      await movieComment.save().catch(err => {
        sendFailBody(ctx.body, err)
      })
    } else {
      comment.userName = userName
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
    ctx.body = successBody
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
    let resBody = successBody
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
    let resBody = successBody
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
module.exports = router