import logger from '../logger';
import { socket, bot, echo } from './event';
import {
  FriendAdd,
  FriendRecall,
  FriendRequest,
  GroupAdminChange,
  GroupFileUpload,
  GroupHonor,
  GroupMemberChange,
  GroupMessage,
  GroupMute,
  GroupPoke,
  GroupRecall,
  GroupRequest,
  Message,
  LuckyKing,
  Notice,
  PrivateMessage,
  Request
} from './Message';

/**
 * @description 聊天消息
 * */
const message = (data: Message) => {
  switch (data.message_type) {
    case "group":
      // 群消息
      const groupMsg: GroupMessage = {
        sender: data.sender,
        anonymous: data.anonymous,
        group_id: data.group_id,
        raw_message: data.raw_message,
        message: data.message,
        font: data.font,
        self_id: data.self_id,
        message_id: data.message_id,
      };

      bot.emit('group_message', groupMsg)
      break;
    case "private":
      // 私聊消息
      const privateMsg: PrivateMessage = {
        sender: data.sender,
        raw_message: data.raw_message,
        message: data.message,
        font: data.font,
        self_id: data.self_id,
        message_id: data.message_id
      };

      bot.emit('private_message', privateMsg)
      break;
  }
}

/**
 * @description 通知消息
 * */
const notice = (data: Notice) => {
  switch (data.notice_type) {
    case 'group_upload':
      // 群文件上传
      const group_upload: GroupFileUpload = {
        group_id: data.group_id,
        user_id: data.user_id,
        file: data.file
      }
      bot.emit('group_file_upload', group_upload)
      break;
    case 'group_admin':
      // 管理员变动
      const group_admin: GroupAdminChange = {
        group_id: data.group_id,
        user_id: data.user_id,
        type: data.sub_type
      }
      bot.emit('group_admin_change', group_admin)
      break;
    case 'group_decrease':
      // 群成员减少
      const group_decrease: GroupMemberChange = {
        group_id: data.group_id,
        user_id: data.user_id,
        type: data.sub_type,
        operator: data.operator_id
      }
      bot.emit('group_decrease', group_decrease)
      break;
    case 'group_increase':
      // 群成员减少
      const group_increase: GroupMemberChange = {
        group_id: data.group_id,
        user_id: data.user_id,
        type: data.sub_type,
        operator: data.operator_id
      }
      bot.emit('group_increase', group_increase)
      break;
    case 'group_mute':
      // 群禁言
      const group_mute: GroupMute = {
        group_id: data.group_id,
        user_id: data.user_id,
        type: data.sub_type,
        operator: data.operator_id,
        duration: data.duration
      }
      bot.emit('group_mute', group_mute)
      break;
    case 'friend_add':
      // 好友添加
      const friend_add: FriendAdd = {
        user_id: data.user_id,
      }
      bot.emit('friend_add', friend_add)
      break;
    case 'group_recall':
      // 撤回群消息
      const group_recall: GroupRecall = {
        group_id: data.group_id,
        user_id: data.user_id,
        operator: data.operator_id,
        message_id: data.message_id
      }
      bot.emit('group_recall', group_recall)
      break;
    case 'friend_recall':
      // 撤回好友消息
      const friend_recall: FriendRecall = {
        user_id: data.user_id,
        message_id: data.message_id
      }
      bot.emit('friend_recall', friend_recall)
      break;
    case 'poke':
      // 群聊戳一戳
      const poke: GroupPoke = {
        user_id: data.user_id,
        group_id: data.group_id,
        target_id: data.target_id
      }
      bot.emit('poke', poke)
      break;
    case 'lucky_king':
      // 红包运气王
      const lucky_king: LuckyKing = {
        user_id: data.user_id,
        group_id: data.group_id,
        target_id: data.target_id
      }
      bot.emit('lucky_king', lucky_king)
      break;
    case 'honor':
      // 群荣誉变更
      const honor: GroupHonor = {
        user_id: data.user_id,
        group_id: data.group_id,
        type: data.honor_type
      }
      bot.emit('honor', honor)
      break;
  }
}

/**
 * @description 请求消息
 * */
const request = (data: Request) => {
  switch (data.request_type) {
    case 'friend':
      // 好友请求
      const friend: FriendRequest = {
        user_id: data.user_id,
        comment: data.comment,
        flag: data.flag
      }
      bot.emit('friend_request', friend)
      break;
    case 'group':
      // 加群请求
      const group: GroupRequest = {
        user_id: data.user_id,
        group_id: data.group_id,
        comment: data.comment,
        type: data.sub_type,
        flag: data.flag,
      }
      bot.emit('group_request', group)
      break;
  }
}

export default () => {
  socket.on('message', (msg: any) => {
    logger('Websocket Receive').debug(msg);
    if(msg.post_type) {
      switch (msg.post_type) {
        case 'message':
          // 消息
          message(msg);
          break;
        case 'notice':
          // 通知
          notice(msg);
          break;
        case 'request':
          // 请求消息
          request(msg);
          break;
        case 'meta_event':
          // 元事件
          break;
        default:
          logger('Websocket Receive').warn(`未知的通知类型: ${msg.post_type}`)
      }
    } else if (msg.echo) {
      echo.emit('echo', {
        uuid: msg.echo,
        data: msg.data
      });
    }
  });
}