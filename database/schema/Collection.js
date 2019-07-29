const mongoose = require('mongoose')
const Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId

// 创建UserScheme
const collectionSchema = new Schema({
  collectionId: {
    type: ObjectId
  },
  collectionCount: {
    type: Number,
    default: 0
  },
  collectionOwner: {
    type: String,
    unique: true
  },
  collectionList: [{
    title: String,
    id: String,
    directors: Array,
    collectTime: String
  }]
})

//发布模型
mongoose.model('Collection', collectionSchema)