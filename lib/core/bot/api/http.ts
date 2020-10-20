import got from 'got';
import config from '../../../../config';
import {
  httpApiReturn,
  httpApiReturn_sendMessage,
  httpApiReturn_getMessage,
  httpApiReturn_GoCQHTTP_getGroupMessage,
  httpApiReturn_GoCQHTTP_getForwardMsg,
  httpApiReturn_getForwardMsg,
  httpApiReturn_loginInfo,
  httpApiReturn_friendList,
  httpApiReturn_groupInfo,
  httpApiReturn_groupList,
  httpApiReturn_groupMemberList,
  httpApiReturn_groupMemberInfo,
  httpApiReturn_getImage,
} from './types';

const request = async (path: string, body: object): Promise<httpApiReturn> => {
  const result = (await got(`http://${config.connect.host}:${config.connect.http_port}/${path}?access_token=${config.connect.token}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    }
  }));

  try{
    const r = JSON.parse(result.body);
    return Object.assign({ statusCode: result.statusCode }, r);
  }catch(e) {
    return {
      statusCode: result.statusCode,
      retcode: -1,
      status: 'failure',
      data: null
    };
  }
}

export default {
  OneBot: {
    message: {
      /**
       * @description 发送私聊消息
       * @param user_id 对方QQ号
       * @param message 消息内容
       * @param auto_escape 是否作为纯文本发送
       */
      sendPrivateMsg: (user_id: number, message: string, auto_escape?: boolean): Promise<httpApiReturn_sendMessage> => {
        return request('send_private_msg', {
          user_id: user_id,
          message: message,
          auto_escape: auto_escape
        })
      },
      /**
       * @description 发送群聊消息
       * @param group_id 群号
       * @param message 消息内容
       * @param auto_escape 是否作为纯文本发送
       */
      sendGroupMsg: (group_id: number, message: string, auto_escape?: boolean): Promise<httpApiReturn_sendMessage> => {
        return request('send_group_msg', {
          group_id: group_id,
          message: message,
          auto_escape: auto_escape
        })
      },
      /**
       * @description 撤回消息
       * @param message_id 消息id
       */
      delete_msg: (message_id: number): Promise<httpApiReturn> => {
        return request('delete_msg', {
          message_id: message_id
        })
      },
      /**
       * @description 获取消息
       * @param message_id 消息id
       */
      getMsg: (message_id: number): Promise<httpApiReturn_getMessage> => {
        return request('get_msg', {
          message_id: message_id
        })
      },
      /**
       * @description 获取合并转发消息
       * @param id 合并转发id
       */
      getForwardMsg: (id: string): Promise<httpApiReturn_getForwardMsg> => {
        return request('get_forward_msg', {
          id: id
        })
      }
    },
    like: {
      /**
       * @description 发送名片赞
       * @param user_id QQ号
       * @param times 次数
       */
      sendLike: (user_id: number, times: number) => {
        return request('send_like', {
          user_id: user_id,
          times: times
        })
      }
    },
    group: {
      /**
       * @description 群组踢人
       * @param group_id 群号
       * @param user_id QQ号
       * @param reject_add_request 拒绝再次加入
       */
      kick: (group_id: number, user_id: number, reject_add_request?: boolean): Promise<httpApiReturn> => {
        return request('set_group_kick', {
          group_id: group_id,
          user_id: user_id,
          reject_add_request: reject_add_request,
        })
      },
      /**
       * @description 群组单人禁言
       * @param group_id 群号
       * @param user_id QQ号
       * @param duration 时长（0为取消禁言）
       */
      mute: (group_id: number, user_id: number, duration?: number): Promise<httpApiReturn> => {
        return request('set_group_ban', {
          group_id: group_id,
          user_id: user_id,
          duration: duration,
        })
      },
      /**
       * @description 群组匿名用户禁言
       * @param group_id 群号
       * @param flag 匿名消息上报的flag
       * @param duration 时长（0为取消禁言）
       */
      anonymousMute: (group_id: number, flag: string, duration?: number): Promise<httpApiReturn> => {
        return request('set_group_anonymous_ban', {
          group_id: group_id,
          flag: flag,
          duration: duration,
        })
      },
      /**
       * @description 群组全员禁言
       * @param group_id 群号
       * @param enable 是否禁言
       */
      wholeMute: (group_id: number, enable?: boolean): Promise<httpApiReturn> => {
        return request('set_group_whole_ban', {
          group_id: group_id,
          enable: enable,
        })
      },
      /**
       * @description 设置群管理员
       * @param group_id 群号
       * @param user_id QQ号
       * @param enable true 为设置，false 为取消
       */
      setAdmin: (group_id: number, user_id: number, enable?: boolean): Promise<httpApiReturn> => {
        return request('set_group_admin', {
          group_id: group_id,
          user_id: user_id,
          enable: enable,
        })
      },
      /**
       * @description 设置匿名聊天
       * @param group_id 群号
       * @param enable 是否允许匿名聊天
       */
      setAnonymous: (group_id: number, enable?: boolean): Promise<httpApiReturn> => {
        return request('set_group_anonymous', {
          group_id: group_id,
          enable: enable,
        })
      },
      /**
       * @description 设置群名片
       * @param group_id 群号
       * @param user_id QQ号
       * @param card 群名片
       */
      setCard: (group_id: number, user_id: number, card?: string): Promise<httpApiReturn> => {
        return request('set_group_card', {
          group_id: group_id,
          user_id: user_id,
          card: card
        })
      },
      /**
       * @description 设置群名
       * @param group_id 群号
       * @param name 群名
       */
      setName: (group_id: number, name: string): Promise<httpApiReturn> => {
        return request('set_group_name', {
          group_id: group_id,
          group_name: name
        })
      },
      /**
       * @description 退群
       * @param group_id 群号
       * @param is_dismiss 是否解散
       */
      leave: (group_id: number, is_dismiss?: boolean): Promise<httpApiReturn> => {
        return request('set_group_leave', {
          group_id: group_id,
          is_dismiss: is_dismiss
        })
      },
      /**
       * @description 设置专属头衔
       * @param group_id 群号
       * @param user_id QQ号
       * @param title 头衔
       * @param duration 有效期
       */
      setSpecialTitle: (group_id: number, user_id: number, title?: string, duration?: number): Promise<httpApiReturn> => {
        return request('set_group_special_title', {
          group_id: group_id,
          user_id: user_id,
          special_title: title,
          duration: duration
        })
      },
      /**
       * @description 获取群信息
       * @param group_id 群号
       * @param no_cache 不使用缓存
       */
      getInfo: (group_id: number, no_cache?: boolean): Promise<httpApiReturn_groupInfo> => {
        return request('get_group_info', {
          group_id: group_id,
          no_cache: no_cache
        })
      },
      /**
       * @description 获取群成员信息
       * @param group_id 群号
       * @param user_id QQ号
       */
      getMemberInfo: (group_id: number, user_id: number): Promise<httpApiReturn_groupMemberInfo> => {
        return request('get_group_member_info', {
          group_id: group_id,
          user_id: user_id
        })
      },
      /**
       * @description 获取群成员列表
       * @param group_id 群号
       */
      getMemberList: (group_id: number): Promise<httpApiReturn_groupMemberList> => {
        return request('get_group_member_list', {
          group_id: group_id
        })
      },
      /**
       * @description 获取群荣誉信息
       * @param group_id 群号
       * @param type 类型
       */
      getHonorInfo: (group_id: number, type: ('talkative'|'performer'|'legend'|'strong_newbie'|'emotion'|'all')) => {
        return request('get_group_honor_info', {
          group_id: group_id,
          type: type
        })
      }
    },
    request: {
      /**
       * @description 处理好友请求
       * @param flag 上报信息中的flag
       * @param approve 是否同意
       * @param remark 备注名
       */
      friend: (flag: string, approve: boolean, remark?: string): Promise<httpApiReturn> => {
        return request('set_friend_add_request', {
          flag: flag,
          approve: approve,
          remark: remark,
        })
      },
      /**
       * @description 处理加群请求
       * @param flag 上报信息中的flag
       * @param type 上报信息中的type
       * @param approve 是否同意
       * @param reason 拒绝原因
       */
      group: (flag: string, type: string, approve: boolean, reason?: string): Promise<httpApiReturn> => {
        return request('set_group_add_request', {
          flag: flag,
          approve: approve,
          type: type,
          reason: reason
        })
      },
    },
    user: {
      /**
       * @description 获取陌生人信息
       * @param user_id QQ号
       * @param no_cache 不使用缓存
       */
      strangerInfo: (user_id: number, no_cache?: boolean): Promise<httpApiReturn> => {
        return request('get_stranger_info', {
          user_id: user_id,
          no_cache: no_cache
        })
      }
    },
    image: {
      /**
       * @description 获取图片
       * @param file 文件名
       */
      getImage: (file: string): Promise<httpApiReturn_getImage> => {
        return request('get_group_list', {
          file: file
        })
      }
    },
    bot: {
      /**
       * @description 获取登录号信息
       */
      getLoginInfo: (): Promise<httpApiReturn_loginInfo> => {
        return request('get_login_info', {})
      },
      /**
       * @description 获取好友列表
       */
      getFriendList: (): Promise<httpApiReturn_friendList> => {
        return request('get_friend_list', {})
      },
      /**
       * @description 获取好友列表
       */
      getGroupList: (): Promise<httpApiReturn_groupList> => {
        return request('get_group_list', {})
      },
      /**
       * @description 重启OneBot
       */
      restart: (): Promise<httpApiReturn> => {
        return request('set_restart', {})
      },
      /**
       * @description 获取版本信息
       */
      version: (): Promise<httpApiReturn> => {
        return request('get_version_info', {})
      },
      /**
       * @description 清理缓存
       */
      cleanCache: (): Promise<httpApiReturn> => {
        return request('clean_cache', {})
      }
    }
  },
  GoCQHTTP: {
    messgae: {
      /**
       * @description 获取群消息
       * @param message_id 消息id
       */
      getGroupMsg: (message_id: number): Promise<httpApiReturn_GoCQHTTP_getGroupMessage> => {
        return request('get_group_msg', {
          message_id: message_id
        })
      },
      /**
       * @description 获取合并转发消息
       * @param message_id 合并转发id
       */
      getForwardMsg: (message_id: string): Promise<httpApiReturn_GoCQHTTP_getForwardMsg> => {
        return request('get_forward_msg', {
          message_id: message_id
        })
      }
    }
  }
}