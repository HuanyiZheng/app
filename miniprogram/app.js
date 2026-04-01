App({
  globalData: {
    openid: '',
    latestResult: null
  },

  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-7gpeiin9d53235ae',
      traceUser: true
    })

    this.login()
  },

  login() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      this.globalData.openid = res.result.openid
      console.log('登录成功，openid =', res.result.openid)
    }).catch(err => {
      console.error('登录失败', err)
    })
  }
})