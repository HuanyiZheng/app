Page({
  data: {
    qid: '',
    question: null,
    selectedIndex: -1
  },

  onLoad(options) {
    let qid = options.qid || ''

    if (!qid && options.scene) {
      const scene = decodeURIComponent(options.scene)
      const match = scene.match(/(?:^|&)qid=([^&]+)/)
      if (match) {
        qid = match[1]
      }
    }

    if (!qid) {
      wx.showToast({
        title: '缺少题目参数',
        icon: 'none'
      })
      return
    }

    this.setData({ qid })

    wx.cloud.callFunction({
      name: 'getQuestion',
      data: { qid }
    }).then(res => {
      if (res.result.ok) {
        this.setData({
          question: res.result.question
        })
      } else {
        wx.showToast({
          title: res.result.msg || '题目不存在',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error(err)
      wx.showToast({
        title: '加载题目失败',
        icon: 'none'
      })
    })
  },

  handleChoose(e) {
    this.setData({
      selectedIndex: Number(e.detail.value)
    })
  },

  submitAnswer() {
    const { qid, selectedIndex } = this.data

    if (selectedIndex < 0) {
      wx.showToast({
        title: '请先选择答案',
        icon: 'none'
      })
      return
    }

    wx.cloud.callFunction({
      name: 'submitAnswer',
      data: {
        qid,
        selectedIndex
      }
    }).then(res => {
      if (res.result.ok) {
        const app = getApp()
        app.globalData.latestResult = res.result.record

        wx.navigateTo({
          url: '/pages/result/result'
        })
      } else {
        wx.showToast({
          title: res.result.msg || '提交失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error(err)
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    })
  }
})