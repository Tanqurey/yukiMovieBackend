const Koa = require('koa')
const app = new Koa()
const {
  connect,
  initSchemas
} = require('./database/init')
// const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors')
const Router = require('koa-router')

let user = require('./api/user')
let search = require('./api/search')
let collect = require('./api/collect')
let comment = require('./api/comment')
let guest = require('./api/guest')

// 注册body-parser,cors以用于处理post请求和支持跨域
app.use(bodyParser())
app.use(cors())

//连接数据库
;
(async () => {
  await connect()
  initSchemas()
})()

//装载子路由
let router = new Router()
router.use('/user', user.routes())
router.use('/search', search.routes())
router.use('/collect', collect.routes())
router.use('/comment', comment.routes())
router.use('/guest', guest.routes())

//加载路由中间件
app.use(router.routes())
app.use(router.allowedMethods())

app.use(async (ctx) => {
  ctx.body = 'hello koa2'
})

app.listen(3000, () => {
  console.log('[server] is runing at 3000')
})