const REQUEST_SUCCESS_MSG = '请求完成'
const SERVER_ERR_MSG = '服务器出错:'
exports.defaultWhatsUp = "这个人很懒，还没有留下个性签名哦~"

exports.successBody = {
  code: 200,
  msg: REQUEST_SUCCESS_MSG
}

exports.failBody = {
  code: 500,
  msg: SERVER_ERR_MSG,
  err: null
}

exports.sendFailBody = (ctxBody, err) => {
  let resBody = this.failBody
  resBody.err = err
  ctxBody = resBody
}