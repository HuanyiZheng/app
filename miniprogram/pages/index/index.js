const app = getApp()

Page({
  handleScan() {
    if (!app.globalData.openid) {
      wx.showToast({
        title: '正在登录，请稍后再试',
        icon: 'none'
      })
      app.login()
      return
    }

    wx.scanCode({
      onlyFromCamera: true,
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
      const match = res.path.match(/[?&]qid=([^&]+)/)
      if (match) return decodeURIComponent(match[1])
    }

    const result = (res.result || '').trim()

    if (/^q\d+$/.test(result)) {
      return result
    }

    let match = result.match(/^qid=(.+)$/)
    if (match) return decodeURIComponent(match[1])

    match = result.match(/[?&]qid=([^&]+)/)
    if (match) return decodeURIComponent(match[1])

    return ''
  },

  goSummary() {
    wx.navigateTo({
      url: '/pages/summary/summary'
    })
  },

  generateMiniCodes() {
    wx.showLoading({
      title: '生成中'
    })

    wx.cloud.callFunction({
      name: 'batchGenerateMiniCodes',
      data: {
        start: 0,
        limit: 10
      }
    }).then(res => {
      wx.hideLoading()
      console.log('生成结果 res =', res)

      if (res.result && res.result.ok) {
        wx.showToast({
          title: `已生成${res.result.count}个码`,
          icon: 'none'
        })
      } else {
        const msg = (res.result && (res.result.msg || res.result.error)) || '生成失败'
        console.error('云函数返回失败：', res.result)
        wx.showModal({
          title: '生成失败',
          content: String(msg),
          showCancel: false
        })
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('调用云函数失败：', err)
      wx.showModal({
        title: '调用失败',
        content: JSON.stringify(err),
        showCancel: false
      })
    })
  }
})