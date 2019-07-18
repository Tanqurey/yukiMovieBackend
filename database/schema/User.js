const mongoose = require('mongoose')
const Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId
const bcrypt = require('bcrypt')

//加盐位数
const SALT_WORK_FACTOR = 10

// 创建UserScheme
const userSchema = new Schema({
  userId: {
    type: ObjectId
  },
  userName: {
    unique: true,
    type: String
  },
  password: {
    type: String
  },
  createTime: {
    type: Date,
    default: Date.now()
  },
  lastLoginTime: {
    type: Date,
    default: Date.now()
  },
  secureQuestion: {
    type: String
  },
  secureAnswer: {
    type: String
  }
})

// 在每次保存前执行操作
userSchema.pre('save', function (next) {
  //请注意this指向
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    //加盐成功后进行加密
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err)
      this.password = hash
      next()
    })
  })
})

userSchema.pre('save', function (next) {
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(this.secureAnswer, salt, (err, hash) => {
      if (err) return next(err)
      this.secureAnswer = hash
      next()
    })
  })
})

// 为Schema配置实例方法
userSchema.methods = {
  comparePassword: (userInput, password) => {
    return new Promise((res, rej) => {
      bcrypt.compare(userInput, password, (err, isMatch) => {
        if (err) {
          rej(err)
          return
        }
        res(isMatch)
      })
    })
  }
}

//发布模型
mongoose.model('User', userSchema)