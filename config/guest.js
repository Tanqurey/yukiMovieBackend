module.exports = class Guest {
  constructor({
    userName,
    lastLoginTime,
    whatsUp,
    level,
    fansList,
    subscribeList
  }) {
    this.userName = userName
    this.whatsUp = whatsUp
    this.level = level
    this.fansList = fansList
    this.subscribeList = subscribeList
    this.lastLoginTime = lastLoginTime
  }
}