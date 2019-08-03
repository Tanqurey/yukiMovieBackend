const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MovieCommentSchema = new Schema({
  commentCount: {
    type: Number,
    default: 0
  },
  movieInfo: {
    id: {
      type: String
    },
    title: {
      type: String
    }
  },
  commentList: [{
    createTime: {
      type: Number,
      default: Date.now()
    },
    commentTitle: {
      type: String
    },
    commentContent: {
      type: String
    },
    rating: {
      type: Number
    },
    usefulList: {
      type: Array,
      default: []
    },
    uselessList: {
      type: Array,
      default: []
    },
    userName: {
      type: String
    }
  }]
})

mongoose.model('MovieComment', MovieCommentSchema)