Page({
  data: {
    loading: true,
    list: [],
    count: 0,
    totalScore: 0,
    correctCount: 0
  },

  onShow() {
    this.loadSummary()
  },

  loadSummary() {
    this.setData({
      loading: true
    })

    wx.cloud.callFunction({
      name: 'getSummary'
    }).then(res => {
      if (res.result.ok) {
        this.setData({
          loading: false,
          list: res.result.list,
          count: res.result.count,
          totalScore: res.result.totalScore,
          correctCount: res.result.correctCount
        })
      } else {
        this.setData({
          loading: false
        })

        wx.showToast({
          title: res.result.msg || '加载失败',
          icon: 'none'
        })
      }
    }).catch(err => {
      console.error(err)

      this.setData({
        loading: false
      })

      wx.showToast({
        title: '加载汇总失败',
        icon: 'none'
      })
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})