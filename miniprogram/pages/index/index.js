const app = getApp()

Page({
  data: {
    loggingIn: true,
    loggedIn: false,
    loginError: ''
  },

  async onShow() {
    this.setData({
      loggingIn: true,
      loggedIn: false,
      loginError: ''
    })

    try {
      if (app.loginPromise) {
        await app.loginPromise
      } else {
        await app.login()
      }

      this.setData({
        loggingIn: false,
        loggedIn: true,
        loginError: ''
      })
    } catch (err) {
      this.setData({
        loggingIn: false,
        loggedIn: false,
        loginError: '登录失败'
      })
    }
  },

  handleScan() {
    if (!this.data.loggedIn) {
      return
    }

    wx.scanCode({
      success: (res) => {
        const qid = this.parseQid(res)

        if (!qid) {
          wx.showToast({
            title: '二维码内容无效',
            icon: 'none'
          })
          return
        }

        wx.navigateTo({
          url: `/pages/question/question?qid=${qid}`
        })
      },
      fail: () => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        })
      }
    })
  },

  parseQid(res) {
    if (res.path) {
      const fullPath = decodeURIComponent(res.path)

      let match = fullPath.match(/[?&]qid=([^&]+)/)
      if (match) return decodeURIComponent(match[1])

      match = fullPath.match(/[?&]scene=([^&]+)/)
      if (match) {
        const scene = decodeURIComponent(match[1])

        let sceneMatch = scene.match(/(?:^|&)qid=([^&]+)/)
        if (sceneMatch) return decodeURIComponent(sceneMatch[1])

        if (/^q\d+$/.test(scene)) return scene
      }
    }

    const result = decodeURIComponent((res.result || '').trim())

    if (/^q\d+$/.test(result)) {
      return result
    }

    let match = result.match(/^qid=(.+)$/)
    if (match) return decodeURIComponent(match[1])

    match = result.match(/[?&]qid=([^&]+)/)
    if (match) return decodeURIComponent(match[1])

    match = result.match(/[?&]?scene=([^&]+)/)
    if (match) {
      const scene = decodeURIComponent(match[1])

      let sceneMatch = scene.match(/(?:^|&)qid=([^&]+)/)
      if (sceneMatch) return decodeURIComponent(sceneMatch[1])

      if (/^q\d+$/.test(scene)) return scene
    }

    return ''
  },

  goSummary() {
    if (!this.data.loggedIn) {
      return
    }

    wx.navigateTo({
      url: '/pages/summary/summary'
    })
  }
})