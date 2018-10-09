/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

var util = require('../../util/util');

/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
Page({

  /**
   * 初始数据，我们把服务地址显示在页面上
   */
  data: {
    btnIsCanUse : false
  },

  onShow: function(){
    var me = this;
    qcloud.login({
      success(result) {
        console.log(result);
        me.setData({ btnIsCanUse: true });
      },

      fail(error) {
        console.log(error);
        util.showModel('登录失败', error);
        me.setData({ btnIsCanUse: false });
      }
    });
  },

  onUnload: function(){
  },

  onLoad: function () {
  },

  onHide: function(){
  },
  
  doNext: function(){
    wx.navigateTo({
      url: '../newRoom/index',
    });
  }
});