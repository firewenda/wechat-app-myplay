//index.js
const app = getApp()

Page({
  data: {
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

    this.getGoodsList();

  },
  getGoodsList: function (bookName) {
    if (!bookName) {
      bookName = undefined;
    }
    const db = wx.cloud.database()
    // 查询用户所有的 booksList
    db.collection('booksList').where({
      // _openid: this.data.openid,
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
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/bookDetail/index?id=" + e.currentTarget.dataset.id
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
        this.toBorrowList(e.target.dataset.id);
        this.getGoodsList();
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  },
  toBorrowList: function(bookId){
    const db = wx.cloud.database()
    db.collection('booksList').where({
      _id: bookId
    }).get({
      success: res => {
        db.collection('borrowList').add({
          data: {
            bookId: bookId,
            bookname: res.data[0].bookname,
            bookimg: res.data[0].bookimg
          },
          success: res => {
            // 在返回结果中会包含新创建的记录的 _id
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
