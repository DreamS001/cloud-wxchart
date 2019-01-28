//index.js
const app = getApp()
wx.cloud.init();
const db = wx.cloud.database()
var QQMapWX  = require('../../util/qqmap-wx-jssdk.js');
var qqmapsdk;

// var date = require("../../util/date.js");

Page({
  data: {
    navTab: ['世界','自己'],
    currentTab: 0,
    isAuth: false,
    openid: '',
    dataList:[],
    imgUrl:[],
    previewImgList:[],
    city:''
  },
  
  onLoad: function() {
    qqmapsdk = new QQMapWX({
      key: 'ILDBZ-GZN33-ERX3X-3OC5H-T6HJQ-LGB5J' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
    });
    // 获取用户信息
    
    this.getOpenid()
    this.getResume()
    this.loadInfo()
  },

  onHide(){
    console.log('我卸载了')
    this.setData({
      isAuth:false
    })
  },

  //获取当前位置的经纬度
  loadInfo: function () {
    var that = this;
    
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude//维度
        var longitude = res.longitude//经度
        console.log(res);
        that.getLocal(latitude, longitude);
      }
    })
  },

  // 获取当前地理位置
  getLocal: function (latitude, longitude) {
    let _this = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        // console.log(res.result.address_component.city);
        // let province = res.result.ad_info.province
        let city = res.result.ad_info.city
        _this.setData({
          city: city,
        })

      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },

  onGotUserInfo(e) {
    var _this = this
    // console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    var user = e.detail.userInfo;
    wx.setStorageSync('userinfo', e.detail.userInfo)
    // user.push({'openid':_this.openid})
    //插入用户信息数据
    if (e.detail.errMsg == 'getUserInfo:ok') {
      _this.setData({
        isAuth: false
      })
      db.collection('userInfo').add({
        // data 字段表示需新增的 JSON 数据
        data: user
      }).then(res => {
        console.log(res)
        wx.setStorageSync('userId', res._id)
        
      }).catch(err => {
        console.log(err)
      })
    } else {
      wx.showToast({
        title: '请授权后在体验小程序',
        icon: 'none'
      })
    }

  },
  addMood(){
    let that=this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log('已授权')
              wx.navigateTo({
                url: '/pages/newresume/newresume',
              })
            }
          })
        } else {
          console.log('未授权')
          // wx.hideTabBar({})
          that.setData({
            isAuth:true
          })
        }
      }
    })
    
  },
  currentTab: function (e) {
    if (this.data.currentTab == e.currentTarget.dataset.idx) {
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
    if (e.currentTarget.dataset.idx==0){
      this.getResume()
    }else{
      this.getmy();
    }
  },

  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log(res.result.openid)
        wx.setStorageSync('openid', res.result.openid)
        that.setData({
          openid: res.result.openid
        })
      }
    })
  },
  getResume(){
    let that = this;
    db.collection('addImg').get({
      success: function (res) {
        console.log(res)
        // for (var i = 0; i < res.data.length; i++) {
        //   console.log(res.data[i].date)
        //   res.data[i].date = toDate(res.data[i].date)
        // }
        that.setData({
          dataList: res.data
        })

       
        // console.log(list)
      }
    })
  },
  //时间戳转换时间
  toDate(number) {
    var n = number * 1000;
    var date = new Date(n);
    var Y = date.getFullYear() + '/';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    return (Y + M + D)
  },
  getmy() {
    let that = this;
    this.data.dataList=[]
    const db = wx.cloud.database()
    const _ = db.commond
    let openid=wx.getStorageSync('openid')
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
  // // 上传图片
  upImg: function () {
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
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            let fileID = res.fileID;
            //把图片存到users集合表
            const db = wx.cloud.database();
            db.collection("addImg").add({
              data: {
                img_url: fileID
              },
              success: function () {
                wx.showToast({
                  title: '图片存储成功',
                  'icon': 'success',
                  duration: 3000
                })
              },
              fail: function () {
                wx.showToast({
                  title: '图片存储失败',
                  'icon': 'none',
                  duration: 3000
                })
              }
            })
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
  getImg(){
    let that = this;
    db.collection('addImg').get({
      success: function (res) {
        console.log(res)
        var list=res.data
        that.setData({
          imgUrl: list
        })
      }
    })
    
  },
  bindImg(e){
    console.log(e)
    this.data.previewImgList=[]
    let that=this;
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
  onShow() {
    this.getResume()
  }
})

