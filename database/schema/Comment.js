const mongoose = require('mongoose')
const Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId

const commentSchema = new Schema({
  commentId: {
    type: ObjectId
  },
  movieInfo: {
    id: {
      type: String
    },
    title: {
      type: String
    }
  },
  createTime: {
    type: Number
  },
  commentTitle: {
    type: String
  },
  commentContent: {
    type: String
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
  },
  rating: {
    type: Number
  }
})

mongoose.model('Comment', commentSchema)