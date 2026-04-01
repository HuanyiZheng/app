const app = getApp()

Page({
  data: {
    record: null
  },

  onShow() {
    this.setData({
      record: app.globalData.latestResult
    })
  },

  goSummary() {
    wx.navigateTo({
      url: '/pages/summary/summary'
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})