const mongoose = require('mongoose')
const Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId

const UserCommentSchema = new Schema({
  userCommentId: {
    type: ObjectId
  },
  userName: {
    type: String,
    unique: true
  },
  commentCount: {
    type: Number,
    default: 0
  },
  commentList: [{
    commentId: {
      type: ObjectId
    },
    createTime: {
      type: Number
    },
    movieInfo: {
      id: {
        type: String
      },
      title: {
        type: String
      }
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
    }
  }]
})

mongoose.model('UserComment', UserCommentSchema)