import { EventEmitter } from 'events'
import Message from './message'
import Bot, { Config as Conf } from './Bot'
import { v4 as uuid } from 'uuid'
import logger from '../../core/logger'

export interface Config extends Conf{}

export default class API extends Bot {
  private callback: EventEmitter

  constructor (config: Config) {
    super(config)
    this.callback = new EventEmitter()
    this.event.on('echo', (data: { echo: string | symbol; data: any }) => this.callback.emit(data.echo, data))
  }

  public getBuilder () {
    return new Message()
  }

  private makeReq (action: string, params: any) {
    logger('OneBot').debug(`action: ${action}, params: `, params)
    return new Promise((resolve, reject) => {
      const echo = uuid()
      this.callback.once(echo, data => resolve(data))

      this.send({
        action: action,
        echo: echo,
        params: params
      })
    })
  }

  /**
   * @description 发送群消息
   * @param group 群号
   * @param message 消息内容
   * @param autoEscape 是否以纯文本发送
   */
  sendGroupMessage (group: number, message: string | Message, autoEscape?: boolean) {
    return this.makeReq('send_group_msg', {
      group_id: group,
      message: typeof (message) === 'string' ? message : message.getMsg(),
      auto_escape: autoEscape || false
    })
  }

  /**
   * @description 发送私聊消息
   * @param user 对方用户id
   * @param message 消息内容
   * @param autoEscape 是否以纯文本发送
   */
  sendPrivateMessage (user: number, message: string | Message, autoEscape?: boolean) {
    return this.makeReq('send_private_msg', {
      user_id: user,
      message: typeof (message) === 'string' ? message : message.getMsg(),
      auto_escape: autoEscape || false
    })
  }

  /**
   * @description 撤回消息
   * @param id 消息id
   */
  deleteMessage (id: number) {
    return this.makeReq('delete_msg', {
      message_id: id
    })
  }

  /**
   * @description 获取消息
   * @param id 消息id
   */
  getMessage (id: number) {
    return this.makeReq('get_msg', {
      message_id: id
    })
  }

  /**
   * @description 获取合并转发消息
   * @param id 合并转发id
   */
  getForwardMessage (id: string) {
    return this.makeReq('get_forward_msg', { id })
  }

  /**
   * @description 发送名片赞
   * @param user 用户id
   * @param times 次数
   */
  sendLike (user: number, times?: number) {
    return this.makeReq('send_like', {
      user_id: user,
      times: times || 1
    })
  }

  /**
   * @description 群组踢人
   * @param group 群号
   * @param user 用户id
   * @param rejectAddRequest 拒绝此人的加群申请
   */
  groupKick (group: number, user: number, rejectAddRequest?: boolean) {
    return this.makeReq('set_group_kick', {
      group_id: group,
      user_id: user,
      reject_add_request: rejectAddRequest || false
    })
  }

  /**
   * @description 群组禁言
   * @param user 用户id
   * @param group 群号
   * @param duration 时长，单位秒
   */
  groupMute (user: number, group: number, duration: number) {
    return this.makeReq('set_group_kick', {
      group_id: group,
      user_id: user,
      duration: duration
    })
  }

  /**
   * @description 群组匿名用户禁言
   * @param flag 匿名用户的flag
   * @param group 群号
   * @param duration 时长，单位秒
   */
  groupAnonymousMute (flag: string, group: number, duration: number) {
    return this.makeReq('set_group_kick', {
      group_id: group,
      flag: flag,
      duration: duration
    })
  }

  /**
   * @description 群组全员禁言
   * @param group 群号
   * @param enable 是否禁言
   */
  groupWholeMute (group: number, enable: boolean) {
    return this.makeReq('set_group_kick', {
      group_id: group,
      enable: enable
    })
  }

  /**
   * @description 设置群管理员
   * @param group 群号
   * @param user 用户id
   * @param enable 是否设置为管理员
   */
  setGroupAdmin (group: number, user: number, enable: boolean) {
    return this.makeReq('set_group_admin', {
      group_id: group,
      user_id: user,
      enable: enable
    })
  }

  /**
   * @description 设置群名片
   * @param group 群号
   * @param user 用户id
   * @param card 群名片
   */
  setGroupCard (group: number, user: number, card?: string) {
    return this.makeReq('set_group_admin', {
      group_id: group,
      user_id: user,
      card: card || ''
    })
  }

  /**
   * @description 设置群名
   * @param group 群号
   * @param title 群名
   */
  setGroupName (group: number, title: string) {
    return this.makeReq('set_group_name', {
      group_id: group,
      group_name: title
    })
  }

  /**
   * @description 设置专属头衔
   * @param group 群号
   * @param user 用户id
   * @param title 头衔
   */
  setGroupSpecialTitle (group: number, user: number, title: string) {
    return this.makeReq('set_group_special_title', {
      group_id: group,
      user_id: user,
      special_title: title
    })
  }

  /**
   * @description 获取机器人账号信息
   */
  getMe () {
    return this.makeReq('get_login_info', {})
  }

  /**
   * @description 获取陌生人信息
   * @param user 用户id
   * @param noCache 不使用缓存
   */
  getStrangerInfo (user: number, noCache?: boolean) {
    return this.makeReq('get_stranger_info', {
      user_id: user,
      no_cache: noCache || false
    })
  }

  /**
   * @description 获取好友列表
   */
  getFriendList () {
    return this.makeReq('get_friend_list', {})
  }

  /**
   * @description 获取群信息
   * @param group 群号
   * @param noCache 不使用缓存
   */
  getGroupInfo (group: number, noCache?: boolean) {
    return this.makeReq('get_group_info', {
      group_id: group,
      no_cache: noCache || false
    })
  }

  /**
   * @description 获取群列表
   */
  getGroupList () {
    return this.makeReq('get_group_list', {})
  }

  /**
   * @description 获取群成员信息
   * @param group 群号
   * @param user 用户id
   * @param noCache 不使用缓存
   */
  getGroupMemberInfo (group: number, user: number, noCache?: boolean) {
    return this.makeReq('get_group_member_info', {
      group_id: group,
      user_id: user,
      no_cache: noCache || false
    })
  }

  /**
   * @description 获取群成员列表
   * @param group 群号
   */
  getGroupMemberList (group: number) {
    return this.makeReq('get_group_member_list', { group_id: group })
  }

  /**
   * @description 获取语音
   * @param file 文件
   * @param format 格式
   */
  getRecord (file: string, format: string) {
    return this.makeReq('get_record', {
      file: file,
      out_format: format
    })
  }

  /**
   * @description 获取图片
   * @param file 文件
   */
  getImage (file: string) {
    return this.makeReq('get_image', { file })
  }
}
