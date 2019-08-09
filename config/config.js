const REQUEST_SUCCESS_MSG = '请求完成'
const SERVER_ERR_MSG = '服务器出错:'
exports.defaultWhatsUp = "这个人很懒，还没有留下个性签名哦~"
exports.USEFUL_FLAG = 1
exports.USELESS_FLAG = 0

const successBody = {
  code: 200,
  msg: REQUEST_SUCCESS_MSG
}

exports.getSuccessBody = function () {
  return {
    code: 200,
    msg: REQUEST_SUCCESS_MSG
  }
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

exports.COUNT_HANDLE = {
  add: 1,
  remove: -1
}

exports.ERR_CATE = {
  NOT_FOUND: 'NOT_FOUND'
}

exports.COUNT_CATE = {
  fans: 0,
  subscribe: 1
}

exports.COMMENT_CATE = {
  latest: 0,
  hottest: 1
}