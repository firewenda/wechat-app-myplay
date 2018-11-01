//index.js
const app = getApp()

Page({
  data: {
    openid: '',
    bookName: '',
    goods: [],
    searchInput: '',
    loadingMoreHidden: true
  },

  onLoad: function() {
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

    this.getGoodsList();

  },
  getGoodsList: function (bookName) {
    if (!bookName) {
      bookName = undefined;
    }
    const db = wx.cloud.database()
    // 查询当前用户所有的 booksList
    db.collection('booksList').where({
      _openid: this.data.openid,
      bookname: bookName
    }).get({
      success: res => {
        this.setData({
          goods: [],
          loadingMoreHidden: true
        });
        var goods = [];
        if (res.data.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        for (var i = 0; i < res.data.length; i++) {
          goods.push(res.data[i]);
        }
        this.setData({
          goods: goods
        });
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
  },
  listenerSearchInput: function (e) {
    this.setData({
      bookName: e.detail.value
    })
  },
  toSearch: function () {
    this.getGoodsList(this.data.bookName);
  },
  toBorrow: function(e){
    const db = wx.cloud.database()
    db.collection('booksList').doc(e.target.dataset.id).update({
      data: {
        booknum: 0
      },
      success: res => {
        this.getGoodsList();
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: 'hello',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
