//index.js
const app = getApp()

Page({
  data: {
    openid: '',
    bookData: '',
    bookshelvesIdex: [0, 0],
    bookshelves: [
      ['A', 'B', 'C', 'D'],
      ['01', '02', '03', '04', '05', '06', '07', '08', '09']
    ],
    bookshelvesVal: 'A01',
    categoryIdex: 0,
    categories: ['专业技术', '机器学习', '前端开发', '数据库', '其他'],
    categoryVal: '专业技术'
  },

  onLoad: function(options) {

    if (!wx.cloud) {
      return
    }
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }

    wx.showLoading({
      title: '数据加载中',
    })

    let isbn = options.isbn;
    let that = this;
    wx.request({
      url: 'https://douban.uieee.com/v2/book/isbn/' + isbn,
      header: {
        'Content-Type': 'json', //一个坑，必须要设为json
      },
      success: function (res) {

        wx.hideLoading()

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
    wx.showLoading({
      title: '加载中',
    })
    const db = wx.cloud.database()
    db.collection('booksList').where({
      isbn: e.detail.value.isbn
    }).get({
      success: res => {

        wx.hideLoading()

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
              wx.navigateBack({
                delta: 1
              })
              wx.showToast({
                title: '录入成功',
              })
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

      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  bindMultiPickerChange: function (e) {
    this.setData({
      bookshelvesVal: this.data.bookshelves[0][e.detail.value[0]] + this.data.bookshelves[1][e.detail.value[1]],
      bookshelvesIdex: e.detail.value
    })
  },
  bindCategoryPickerChange: function(e) {
    this.setData({
      categoryVal: this.data.categories[e.detail.value],
      categoryIdex: e.detail.value
    })
  }

})
