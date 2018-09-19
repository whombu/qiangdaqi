var util = require("../../util/util");
var config = require("../../config");
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

Page({
  onShow: function(){
    var me = this;
    qcloud.request({
      url: config.getMyQdRoomUrl,
      method: 'get',
      login: true,
      success: function (val) {
        console.log(val);
        me.setData({
          roomName:val.data.data.roomName,
          roomId: val.data.data.roomId
          //playerNum: val.data.data.playerNum
        });
      },
      fail: function (error) {
        util.showModel("错误", "获取比赛房间失败,请重试...");
      }
    });
  },
  data: {
    roomName : "测试抢答比赛",
    playerNum : 10,
    roomId : null
  },
  goToRoom : function(){
    var me = this;
    wx.redirectTo({
      url: '/page/qdRoom/index?roomId=' + me.data.roomId,
    });
  },
  onShareAppMessage: function (ops) {
    var me = this;
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    return {
      title: wx.getStorageSync('userInfo').nickName + '邀请你加入一场抢答比赛',
      path: '/page/qdRoom/index?roomId=' + me.data.roomId,
      imageUrl : '/images/qiang.jpg',
      success: function (res) {
        // 转发成功 
        console.log("转发成功:" + JSON.stringify(res));
      },
      fail: function (res) {
        // 转发失败 
        console.log("转发失败:" + JSON.stringify(res));
      }
    }
  }
})
