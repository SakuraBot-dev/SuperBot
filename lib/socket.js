const ws = require('ws');
const util = require('util');
const config = require('../config');
const logger = require('./logger').main;

let api = null;
let event = null;
let timer = null;

const queue = [];

const isCi = process.argv.indexOf('ci') !== -1;

const connApi = () => {
  try {
    api.close();
  }catch (e) {
    // fail
  }

  try{
    api = new ws(config.socket.api);
  } catch(e) {
    logger.warn('WebSocket Api 连接失败，正在重连');
    setTimeout(() => {
      connApi();
    }, 3e3);
  }

  api.onclose = () => {
    logger.warn('Socket API WebSocket断开连接，正在重连');
    connApi()
  }

  api.onopen = () => {
    logger.info('Socket API WebSocket连接成功');

    if(timer){
      clearInterval(timer);
    }
    // 处理消息队列
    timer = setInterval(() => {
      const e = queue.pop();
      if(e) {
        module.exports.send(e);
      }
    }, 500);
  }
}

const connEvent = () => {
  try {
    event.close();
  }catch (e) {
    // fail
  }

  try{
    event = new ws(config.socket.event);
  } catch(e) {
    logger.warn('WebSocket Event 连接失败，正在重连');
    setTimeout(() => {
      connEvent();
    }, 3e3);
  }

  event.onclose = () => {
    logger.warn('WebSocket Event 断开连接，正在重连');
    connEvent()
  }

  event.onopen = () => {
    logger.info('Socket Event WebSocket连接成功');
  }

  event.onmessage = (msg) => {
    const e = JSON.parse(msg.data);
    if(e.post_type === 'message'){
      if(e.message_type === 'group'){
        // 群消息事件
        module.exports.on_group_msg({
          msg: e.raw_message,
          sender: e.sender,
          self: e.self_id,
          time: new Date(e.time*1000),
          group: e.group_id
        });
      }else if(e.message_type === 'private'){
        // 私聊消息
        module.exports.on_private_msg({
          msg: e.raw_message,
          sender: e.sender,
          time: new Date(e.time*1000),
        });
      }
    }
  };
}

const start = () => {
  if(isCi) return;
  connApi();
  connEvent();
}

start();

module.exports.send = (data) => {
  if(isCi) return;
  if(!api){
    queue.unshift(data);
  }else{
    try {
      api.send(data);
    } catch (error) {
      logger.error(`Socket api 消息发送失败, ${util.inspect(error)}`);
      queue.unshift(data);
    }
  }
}