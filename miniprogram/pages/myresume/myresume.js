// pages/myresume/myresume.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
  },

  getmy() {
    let that = this;
    this.data.dataList = []
    const db = wx.cloud.database()
    const _ = db.commond
    let openid = wx.getStorageSync('openid')
    db.collection('addImg').where({
      openid: openid
    }).get({
      success: function (res) {
        console.log(res)
        that.setData({
          dataList: res.data
        })
      }
    })
  },
  bindImg(e) {
    console.log(e)
    this.data.previewImgList = []
    let that = this;
    //必须给对应的wxml的image标签设置data-set=“图片路径”，否则接收不到
    var res = e.target.dataset.src

    var list = this.data.previewImgList //页面的图片集合数组
    console.log(list)

    //判断res在数组中是否存在，不存在则push到数组中, -1表示res不存在

    if (list.length == 0) {

      this.data.previewImgList.push(res)

    }
    //所有图片
    // var imgs = this.imgUrl
    wx.previewImage({
      current: res, // 当前显示图片的http链接
      urls: that.data.previewImgList // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getmy()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})