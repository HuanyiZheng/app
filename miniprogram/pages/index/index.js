// 首页逻辑：保留登录状态、扫码答题、查看总分
const app = getApp()

Page({
  data: {
    loggingIn: true,
    loggedIn: false,
    loginError: ''
  },

  async onShow() {
    // 每次回到首页都同步一次登录状态
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
    // 未登录时不继续执行
    if (!this.data.loggedIn) return

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

  // 兼容普通二维码和小程序码
  parseQid(res) {
    if (res.path) {
      const fullPath = decodeURIComponent(res.path)

      // 1. path 中直接带 qid
      let match = fullPath.match(/[?&]qid=([^&]+)/)
      if (match) return decodeURIComponent(match[1])

      // 2. path 中带 scene，再从 scene 里取 qid
      match = fullPath.match(/[?&]scene=([^&]+)/)
      if (match) {
        const scene = decodeURIComponent(match[1])

        let sceneMatch = scene.match(/(?:^|&)qid=([^&]+)/)
        if (sceneMatch) return decodeURIComponent(sceneMatch[1])

        if (/^q\d+$/.test(scene)) return scene
      }
    }

    // 3. 普通二维码内容
    const result = decodeURIComponent((res.result || '').trim())

    if (/^q\d+$/.test(result)) return result

    let match = result.match(/^qid=(.+)$/)
    if (match) return decodeURIComponent(match[1])

    match = result.match(/[?&]qid=([^&]+)/)
    if (match) return decodeURIComponent(match[1])

    // 4. 兼容 result 中是 scene=...
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
    // 未登录时不继续执行
    if (!this.data.loggedIn) return

    wx.navigateTo({
      url: '/pages/summary/summary'
    })
  }
})