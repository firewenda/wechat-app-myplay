//index.js
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    openid: '',
    goods: [],
    loadingMoreHidden: true,
  },

  onLoad: function() {
    if (!wx.cloud) {
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

    wx.showLoading({
      title: '数据加载中',
    })

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
        wx.hideLoading()
        var goods = [];
        if (res.data.length == 0) {
          this.setData({
            loadingMoreHidden: false,
          });
          return;
        }

        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].borrowTime){
            res.data[i].borrowTime = util.formatTime(new Date(res.data[i].borrowTime));
          }
          if (res.data[i].returnTime) {
            res.data[i].returnTime = util.formatTime(new Date(res.data[i].returnTime));
          }
          goods.push(res.data[i]);
        }
        
        this.setData({
          goods: goods
        });
        // console.log('[数据库] [查询记录] 成功: ', res)
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
      db.collection('borrowList').doc(e.target.dataset.id).update({
        data: {
          isBorrowed: false,
          returnTime: new Date().getTime(),
        },
        success: res => {
          db.collection('booksList').doc(e.target.dataset.bookid).update({
            data: {
              booknum: 1
            },
            success: res => {
              this.getGoodsList();
              wx.showToast({
                title: '归还成功',
              })
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
            title: '更新失败',
          })
          console.error('[数据库] [更新记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        title: '无记录',
      })
    }

  },
  toDelItem: function (e){
    if (e.target.dataset.id) {
      const db = wx.cloud.database()
      db.collection('borrowList').doc(e.target.dataset.id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          this.getGoodsList();
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
        title: '无记录可删，请创建一个记录',
      })
    }
  }

})
