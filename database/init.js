const mongoose = require('mongoose')
const glob = require('glob')
const dbUrl = 'mongodb://movieAdmin:yuqiloveu@localhost:27017/yukimovie'
const MAX_CONNECT_TIMES = 3
const {
  resolve
} = require('path')

let connectTimes = 0

//初始化Schema
exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}


exports.connect = () => {
  mongoose.connect(dbUrl, {
    useNewUrlParser: true
  })
  mongoose.set('useCreateIndex', true)
  return new Promise((res, rej) => {
    mongoose.connection.on('disconnected', () => {
      console.log('*****数据库断开，现在重连*****')
      if (connectTimes <= MAX_CONNECT_TIMES) {
        this.connect()
        connectTimes++
      } else {
        rej()
        throw new Error('*****数据库出现故障，已停止服务*****')
      }
    })
    mongoose.connection.on('error', (err) => {
      console.log('*****数据库断开，现在重连*****')
      if (connectTimes <= MAX_CONNECT_TIMES) {
        this.connect()
        connectTimes++
      } else {
        rej(err)
        throw new Error('*****数据库出现故障，已停止服务*****')
      }
    })
    mongoose.connection.once('open', () => {
      console.log('*****已连接数据库*****')
      res()
    })
  })
}