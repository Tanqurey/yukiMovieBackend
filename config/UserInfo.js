module.exports = class UserInfo {
  constructor({
    userName,
    whatsUp,
    exp,
    level,
    fansCount,
    subscribeCount,
    isAdmin
  }) {
    this.userName = userName
    this.whatsUp = whatsUp
    this.exp = exp
    this.level = level
    this.fansCount = fansCount
    this.subscribeCount = subscribeCount
    this.isAdmin = isAdmin
  }
}