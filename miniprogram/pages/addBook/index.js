//index.js
const app = getApp()

Page({
  data: {
    openid: '',
    bookData: ''
  },

  onLoad: function(options) {

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }

    let isbn = options.isbn;
    let that = this;
    wx.request({
      url: 'https://douban.uieee.com/v2/book/isbn/' + isbn,
      header: {
        'Content-Type': 'json', //一个坑，必须要设为json
      },
      success: function (res) {
        if (res.data.code == 404) {
          wx.showModal({
            title: '提示',
            content: '搜索信息有误，请手动添加',
            showCancel: false
          })
        } else {
          that.setData({
            bookData: res.data
          });
        }
      }
    })

  },
  bindSave: function (e) {
    const db = wx.cloud.database()
    db.collection('booksList').where({
      isbn: e.detail.value.isbn
    }).get({
      success: res => {
        if(res.data.length){
          wx.showToast({
            icon: 'none',
            title: '数据已存在'
          })
        }else{
          db.collection('booksList').add({
            data: e.detail.value,
            success: res => {
              // 在返回结果中会包含新创建的记录的 _id
              wx.showToast({
                title: '新增记录成功',
              })
              wx.navigateBack({
                delta: 1
              })
              console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
            },
            fail: err => {
              wx.showToast({
                icon: 'none',
                title: '新增记录失败'
              })
              console.error('[数据库] [新增记录] 失败：', err)
            }
          })
        }
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  }

})
