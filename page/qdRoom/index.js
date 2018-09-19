/**
 * @fileOverview 聊天室综合 Demo 示例
 */


// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

/**
 * 生成一条聊天室的消息的唯一 ID
 */
function msgUuid() {
  if (!msgUuid.next) {
    msgUuid.next = 0;
  }
  return 'msg-' + (++msgUuid.next);
}

/**
 * 生成聊天室的系统消息
 */
function createSystemMessage(content) {
  return { id: msgUuid(), type: 'system', content };
}

/**
 * 生成聊天室的聊天消息
 */
function createUserMessage(content, user, isMe) {
  return { id: msgUuid(), type: 'speak', content, user, isMe };
}

// 声明聊天室页面
Page({

  /**
   * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
   */
  data: {
    messages: [],
    inputContent: '大家好啊',
    lastMessageId: 'none',
    isPlayer: false,//true为普通参赛队员,false为裁判.他们看到的按钮不同,
    isStart: false, //比赛是否开始,true为已开始,false为未开始,
    roomId: null,
    roomName: null,
    refereeOpenId: null,
    isQiang: false,
    isStartQiang: false
  },
  startQiang(){
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入抢答比赛，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }

    setTimeout(() => {
      if (this.data.inputContent && this.tunnel) {
        this.tunnel.emit('begin', { word: 'begin' });
        this.setData({
          isStartQiang: true
        });
      }
    });
    
  },
  startGame() {
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入抢答比赛，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }

    setTimeout(() => {
      if (this.tunnel) {
        this.tunnel.emit('startGame', { word: 'startGame' });
      }
    });
  },
  endGame() {
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入抢答比赛，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }

    setTimeout(() => {
      if (this.tunnel) {
        this.tunnel.emit('endGame', { word: 'endGame' });
      }
    });
  },
  qiang(){
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入抢答比赛，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }
    setTimeout(() => {
      if (this.tunnel) {
        this.tunnel.emit('qiang', { word: 'qiang' });
        this.setData({
          isQiang: false
        });
      }
    });
  },
  onLoad(options){
    var me = this;
    var roomId = options.roomId;
    console.log(roomId);
    qcloud.request({
      url: config.getQdRoomByRoomIdUrl + "?roomId=" + roomId,
      success: function (qdRoomVal) {
        var refereeOpenId = qdRoomVal.data.data.refereeOpenId;
        me.setData({
          roomId: roomId,
          roomName: qdRoomVal.data.data.roomName,
          isStart: qdRoomVal.data.data.isStart,
          refereeOpenId: refereeOpenId
        });
        wx.setNavigationBarTitle({ title: qdRoomVal.data.data.roomName });
        qcloud.request({
          url: config.requestUserUrl,
          success: function (userVal) {
            if (refereeOpenId == userVal.data.data.userInfo.openId){
              me.setData({
                isPlayer: false
              });
            }else{
              me.setData({
                isPlayer: true
              });
            }
          }
        });
      }
    });
    
  },
  /**
   * 页面渲染完成后，启动聊天室
   * */
  onReady() {
    if (!this.pageReady) {
      this.pageReady = true;
      this.enter();
    }
  },

  /**
   * 后续后台切换回前台的时候，也要重新启动聊天室
   */
  onShow() {
    if (this.pageReady) {
      this.enter();
    }
  },

  /**
   * 页面卸载时，退出聊天室
   */
  onUnload() {
    this.quit();
  },

  /**
   * 页面切换到后台运行时，退出聊天室
   */
  onHide() {
    this.quit();
  },

  /**
   * 启动聊天室
   */
  enter() {
    this.pushMessage(createSystemMessage('正在登录...'));

    // 如果登录过，会记录当前用户在 this.me 上
    if (!this.me) {
      qcloud.request({
        url: config.requestUserUrl,
        login: true,
        success: (response) => {
          this.me = response.data.data.userInfo;
          this.connect();
        }
      });
    } else {
      this.connect();
    }
  },

  /**
   * 连接到聊天室信道服务
   */
  connect() {
    var that = this;
    this.amendMessage(createSystemMessage('正在加入抢答比赛...'));

    // 创建信道
    var tunnel = this.tunnel = new qcloud.Tunnel(config.qdTunnelUrl + "?roomId=" + that.data.roomId);
    //var tunnel = this.tunnel = new qcloud.Tunnel(config.tunnelUrl);
    //var tunnel = this.tunnel = new qcloud.Tunnel(config.qdTunnelUrl);	
    // 连接成功后，去掉「正在加入群聊」的系统提示
    tunnel.on('connect', () => this.popMessage());

    // 聊天室有人加入或退出，反馈到 UI 上
    tunnel.on('people', people => {
      const { total, enter, leave } = people;

      if (enter) {
        console.log(enter.openId, that.data.refereeOpenId);
        if (enter.openId == that.data.refereeOpenId){
          this.amendMessage(createSystemMessage(`${enter.nickName}(裁判)已加入比赛`));
        }else
          this.amendMessage(createSystemMessage(`${enter.nickName}(队员)已加入比赛，当前共 ${total} 人参赛`));
      } else {
        if (leave.openId == that.data.refereeOpenId)
          this.amendMessage(createSystemMessage(`${leave.nickName}(裁判)已退出比赛`));
        else
          this.amendMessage(createSystemMessage(`${leave.nickName}(队员)已退出比赛，当前共 ${total} 人参赛`));
      }
    });

    // 有人说话，创建一条消息
    tunnel.on('speak', speak => {
      const { word, who } = speak;
      if(word == "startGame"){
        this.setData({
          isStart: true
        });
        this.amendMessage(createSystemMessage("比赛开始"));
      }else if(word == "endGame"){

      }else if(word == "begin"){
        this.setData({
          isQiang: true
        });
        this.amendMessage(createSystemMessage("开始抢答"));
      }else if(word == "qiang"){
        this.setData({
          isStartQiang: false,
          isQiang: false
        });
        this.amendMessage(createSystemMessage("抢答结束," + who.nickName + "抢答成功"));
      }
    });
    // 信道关闭后，显示退出群聊
    tunnel.on('close', () => {
      this.pushMessage(createSystemMessage('您已退出比赛'));
    });

    // 重连提醒
    tunnel.on('reconnecting', () => {
      this.pushMessage(createSystemMessage('已断线，正在重连...'));
    });

    tunnel.on('reconnect', () => {
      this.amendMessage(createSystemMessage('重连成功'));
    });

    // 打开信道
    tunnel.open();
  },

  /**
   * 退出聊天室
   */
  quit() {
    if (this.tunnel) {
      this.tunnel.close();
    }
  },

  /**
   * 通用更新当前消息集合的方法
   */
  updateMessages(updater) {
    var messages = this.data.messages;
    updater(messages);

    this.setData({ messages });

    // 需要先更新 messagess 数据后再设置滚动位置，否则不能生效
    var lastMessageId = messages.length ? messages[messages.length - 1].id : 'none';
    this.setData({ lastMessageId });
  },

  /**
   * 追加一条消息
   */
  pushMessage(message) {
    this.updateMessages(messages => messages.push(message));
  },

  /**
   * 替换上一条消息
   */
  amendMessage(message) {
    this.updateMessages(messages => messages.splice(-1, 1, message));//-1表示从数组结尾处选择
  },

  /**
   * 替换第一条消息
   */
  amendFirstMessage(message) {
    this.updateMessages(messages => messages.splice(0, 1, message));//-1表示从数组结尾处选择
  },

  /**
   * 删除上一条消息
   */
  popMessage() {
    this.updateMessages(messages => messages.pop());
  },

  /**
   * 用户输入的内容改变之后
   */
  changeInputContent(e) {
    this.setData({ inputContent: e.detail.value });
  },
  
  /**
   * 点击「发送」按钮，通过信道推送消息到服务器
   **/
  sendMessage(e) {
    // 信道当前不可用
    if (!this.tunnel || !this.tunnel.isActive()) {
      this.pushMessage(createSystemMessage('您还没有加入比赛，请稍后重试'));
      if (this.tunnel.isClosed()) {
        this.enter();
      }
      return;
    }

    setTimeout(() => {
      if (this.data.inputContent && this.tunnel) {
        this.tunnel.emit('speak', { word: this.data.inputContent });
        this.setData({ inputContent: '' });
      }
    });
  }
    
});