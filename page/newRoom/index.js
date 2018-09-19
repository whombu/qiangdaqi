
var util = require("../../util/util");
var config = require("../../config");
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

Page({
  data: {
    focus: false,
    inputValue: ''
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var roomName = e.detail.value.roomName ? e.detail.value.roomName : "抢答比赛";
    var playerNum = e.detail.value.playerNum ? e.detail.value.playerNum : 10;
    var validNo = e.detail.value.validNo ? e.detail.value.validNo : -1;
    util.showBusy("加载中...");
    qcloud.request({
      url: config.createRoomUrl,
      header: {'content-type' : 'application/x-www-form-urlencoded'},
      method : 'post',
      login: true,
      data : {
        roomName: encodeURIComponent(roomName)//,
        //playerNum: playerNum,
        //validNo: validNo
      },
      success : function(){
        wx.redirectTo({
          url: '../share/index',
        });
      },
      fail: function(error){
        util.showModel("错误","创建比赛房间失败,请重试...");
      }
    });
    
  },
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  bindReplaceInput: function (e) {
    var value = e.detail.value
    var pos = e.detail.cursor
    var left
    if (pos !== -1) {
      // 光标在中间
      left = e.detail.value.slice(0, pos)
      // 计算光标的位置
      pos = left.replace(/11/g, '2').length
    }

    // 直接返回对象，可以对输入进行过滤处理，同时可以控制光标的位置
    return {
      value: value.replace(/11/g, '2'),
      cursor: pos
    }

    // 或者直接返回字符串,光标在最后边
    // return value.replace(/11/g,'2'),
  },
  bindHideKeyboard: function (e) {
    if (e.detail.value === '123') {
      // 收起键盘
      wx.hideKeyboard()
    }
  },
  onShow: function(){
    
  },
})
