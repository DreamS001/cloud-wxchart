// pages/newresume/newresume.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileID:'',
    concent:'',
    img:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  bindTextAreaBlur(e) {
    console.log(e)
    this.content = e.detail.value
    console.log(this.content)
  },
  // 上传图片
  upImg: function () {
    let _this=this
   
    // console.log(_this.img)
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        let timestamp = Date.parse(new Date());
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0] + timestamp
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            console.log(res.fileID)
            var imgs1 = []
            imgs1.push(res.fileID)
            console.log(imgs1)
            _this.setData({
              img: imgs1
            })
            console.log(_this.data.img)
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            _this.setData({
              fileID: res.fileID
            })
            // let fileID = res.fileID;

            // _this.setData({
            //   img: []
            // })
           
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  pTba(){
    //把图片存到users集合表
    let _this=this;
    let openid = wx.getStorageSync('openid')
    let userinfo = wx.getStorageSync('userinfo')
    let timestamp = Date.parse(new Date());
    const db = wx.cloud.database();
    db.collection("addImg").add({
      data: {
        img_url: _this.data.img[0],
        openid: openid,
        nickname: userinfo.nickName,
        avatar: userinfo.avatarUrl,
        count: _this.content,
        date: timestamp
      },
      success: function () {
        wx.showToast({
          title: '发表成功',
          'icon': 'success',
          duration: 3000,
        })
        setTimeout(function(){
          wx.switchTab({url:'/pages/index/index'})
        },3000)
      },
      fail: function () {
        wx.showToast({
          title: '发表失败',
          'icon': 'none',
          duration: 3000
        })
      }
    })
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