App({
  globalData: {
    openid: '',
    latestResult: null,
    loggedIn: false,
    loginError: ''
  },

  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-7gpeiin9d53235ae',
      traceUser: true
    })
    this.loginPromise = this.login()
  },

  login() {
    this.globalData.loggedIn = false
    this.globalData.loginError = ''

    return wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      this.globalData.openid = res.result.openid
      this.globalData.loggedIn = true
      console.log('登录成功，openid =', res.result.openid)
      return res.result.openid
    }).catch(err => {
      this.globalData.loginError = '登录失败'
      console.error('登录失败', err)
      throw err
    })
  }
})