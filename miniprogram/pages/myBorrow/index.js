//index.js
const app = getApp()

Page({
  data: {
    openid: '',
    goods: [],
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
  getGoodsList: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 booksList
    db.collection('borrowList').where({
      _openid: this.data.openid
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
  toReturn: function(e){

    if (e.target.dataset.id) {
      const db = wx.cloud.database()
      db.collection('borrowList').doc(e.target.dataset.id).remove({
        success: res => {
          db.collection('booksList').doc(e.target.dataset.bookid).update({
            data: {
              booknum: 1
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
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[数据库] [删除记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        title: '无记录可删，请见创建一个记录',
      })
    }

  },

})
