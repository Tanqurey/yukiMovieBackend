const mongoose = require('mongoose')
const Schema = mongoose.Schema
let ObjectId = Schema.Types.ObjectId
const bcrypt = require('bcrypt')
const {
  defaultWhatsUp
} = require('../../config/config')

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
    type: Number,
    default: Date.now()
  },
  lastLoginTime: {
    type: Number,
    default: Date.now()
  },
  secureQuestion: {
    type: String
  },
  secureAnswer: {
    type: String
  },
  whatsUp: {
    type: String,
    default: defaultWhatsUp
  },
  exp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 0
  },
  fansList: {
    type: Array,
    default: []
  },
  subscribeList: {
    type: Array,
    default: []
  },
  isAdmin: {
    type: Boolean,
    default: false
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
  comparePwdOrAns: (userInput, pwdOrAns) => {
    return new Promise((res, rej) => {
      bcrypt.compare(userInput, pwdOrAns, (err, isMatch) => {
        if (err) {
          rej(err)
          return
        }
        res(isMatch)
      })
    })
  },
}

//封装静态方法
// userSchema.statics = {
//   updateUser: (userKey,val) => {

//   }
// }

//发布模型
mongoose.model('User', userSchema)