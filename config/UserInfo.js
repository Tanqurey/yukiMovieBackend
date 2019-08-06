module.exports = class UserInfo {
  constructor({
    userName,
    whatsUp,
    exp,
    level,
    fansList,
    subscribeList,
    isAdmin
  }) {
    this.userName = userName
    this.whatsUp = whatsUp
    this.exp = exp
    this.level = level
    this.fansList = fansList
    this.subscribeList = subscribeList
    this.isAdmin = isAdmin
  }
}