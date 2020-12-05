import { EventEmitter } from 'events';
import httpApi from '../core/bot/api/http';
import { v4 as getUUID} from 'uuid';
import admin from '../admin';
import {
  BotEvent
} from '../core/bot/Message';
import { httpApiReturn_sendMessage } from '../core/bot/api/types';
import { promises } from 'fs';

interface ProcessMessage {
  type: 'event' | 'bot_message' | 'group_update' | 'echo',
  uuid: string,
  sub_type: string,
  event_type: any,
  message_type: any,
  data: any
}

interface App {
  root: string,
  data: string,
  appRoot: string,
  packagename: string,
  restart: boolean
}

interface Command {
  // 正则表达式，匹配命令
  cmd: RegExp,
  // 帮助文本
  helper: string,
  // 支持私聊
  private: boolean,
  // 支持群聊
  group: boolean,
  // 需要全局管理员
  globalAdmin_require: boolean,
  // 需要群聊管理员
  groupAdmin_require: boolean,
  // 需要主人
  owner_require: boolean
}

interface CommandList {
  group: Array<string>,
  private: Array<string>
}

interface event {
  on(event: 'load', listener: () => void): any
  on(event: 'unload', listener: () => void): any
  
  emit(event: 'load'): any
  emit(event: 'unload'): any
  
  addListener(event: 'load', listener: () => void): any
  addListener(event: 'unload', listener: () => void): any
  
  removeAllListeners(event: 'load'): any
  removeAllListeners(event: 'unload'): any

  once(event: 'load', listener: () => void): any
  once(event: 'unload', listener: () => void): any
}

const cmd: CommandList = {
  group: [],
  private: [],
};

const group_stat: {
  [index: string]: boolean
} = {};

export const bot: BotEvent = new EventEmitter();
export const event: event = new EventEmitter();
export const echo: EventEmitter = new EventEmitter();

export const api = {
  http: httpApi,
  socket: {
    message: {
      /**
       * @description 发送群聊消息
       * @param group_id 群号
       * @param message 消息内容
       * @param auto_escape 是否作为纯文本发送
       */
      sendGroupMessage: (group_id: number, message: string, auto_escape?: boolean) => {
        return new Promise(r => {
          if(group_stat[group_id] === undefined) group_stat[group_id] = true;
          if(!group_stat[group_id]) return;

          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('send_group_msg', {
            group_id: group_id,
            message: message,
            auto_escape: auto_escape
          }, uuid)
        })
      },
      /**
       * @description 发送群聊消息
       * @param group_id 群号
       * @param message 消息内容
       * @param auto_escape 是否作为纯文本发送
       */
      sendPrivateMsg: (user_id: number, message: string, auto_escape?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })
          
          sendSocket('send_private_msg', {
            user_id: user_id,
            message: message,
            auto_escape: auto_escape
          }, uuid)
        })
      },
      /**
       * @description 撤回消息
       * @param message_id 消息id
       */
      delete_msg: (message_id: number) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })
          
          sendSocket('delete_msg', {
            message_id: message_id
          }, uuid)
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
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })
          
          sendSocket('send_like', {
            user_id: user_id,
            times: times
          }, uuid)
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
      kick: (group_id: number, user_id: number, reject_add_request?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })
          
          sendSocket('set_group_kick', {
            group_id: group_id,
            user_id: user_id,
            reject_add_request: reject_add_request,
          }, uuid)
        })
      },
      /**
       * @description 群组单人禁言
       * @param group_id 群号
       * @param user_id QQ号
       * @param duration 时长（0为取消禁言）
       */
      mute: (group_id: number, user_id: number, duration?: number) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })
        
          sendSocket('set_group_ban', {
            group_id: group_id,
            user_id: user_id,
            duration: duration,
          }, uuid)
        })
      },
      /**
       * @description 群组匿名用户禁言
       * @param group_id 群号
       * @param flag 匿名消息上报的flag
       * @param duration 时长（0为取消禁言）
       */
      anonymousMute: (group_id: number, flag: string, duration?: number) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_anonymous_ban', {
            group_id: group_id,
            flag: flag,
            duration: duration,
          }, uuid)
        })
      },
      /**
       * @description 群组全员禁言
       * @param group_id 群号
       * @param enable 是否禁言
       */
      wholeMute: (group_id: number, enable?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_whole_ban', {
            group_id: group_id,
            enable: enable,
          }, uuid)
        })
      },
      /**
       * @description 设置群管理员
       * @param group_id 群号
       * @param user_id QQ号
       * @param enable true 为设置，false 为取消
       */
      setAdmin: (group_id: number, user_id: number, enable?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_admin', {
            group_id: group_id,
            user_id: user_id,
            enable: enable,
          }, uuid)
        })
      },
      /**
       * @description 设置匿名聊天
       * @param group_id 群号
       * @param enable 是否允许匿名聊天
       */
      setAnonymous: (group_id: number, enable?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_anonymous', {
            group_id: group_id,
            enable: enable,
          }, uuid)
        })
      },
      /**
       * @description 设置群名片
       * @param group_id 群号
       * @param user_id QQ号
       * @param card 群名片
       */
      setCard: (group_id: number, user_id: number, card?: string) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_card', {
            group_id: group_id,
            user_id: user_id,
            card: card
          }, uuid)
        })
      },
      /**
       * @description 设置群名
       * @param group_id 群号
       * @param name 群名
       */
      setName: (group_id: number, name: string) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_name', {
            group_id: group_id,
            group_name: name
          }, uuid)
        })
      },
      /**
       * @description 退群
       * @param group_id 群号
       * @param is_dismiss 是否解散
       */
      leave: (group_id: number, is_dismiss?: boolean) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_leave', {
            group_id: group_id,
            is_dismiss: is_dismiss
          }, uuid)
        })
      },
      /**
       * @description 设置专属头衔
       * @param group_id 群号
       * @param user_id QQ号
       * @param title 头衔
       * @param duration 有效期
       */
      setSpecialTitle: (group_id: number, user_id: number, title?: string, duration?: number) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_special_title', {
            group_id: group_id,
            user_id: user_id,
            special_title: title,
            duration: duration
          }, uuid)
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
      friend: (flag: string, approve: boolean, remark?: string) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_friend_add_request', {
            flag: flag,
            approve: approve,
            remark: remark,
          }, uuid)
        })
      },
      /**
       * @description 处理加群请求
       * @param flag 上报信息中的flag
       * @param type 上报信息中的type
       * @param approve 是否同意
       * @param reason 拒绝原因
       */
      group: (flag: string, type: string, approve: boolean, reason?: string) => {
        return new Promise(r => {
          const uuid = getUUID();

          echo.once(uuid, data => {
            r(data);
          })

          sendSocket('set_group_add_request', {
            flag: flag,
            approve: approve,
            type: type,
            reason: reason
          }, uuid)
        })
      }
    },
    bot: {
      /**
       * @description 重启OneBot
       */
      restart: () => {
        return new Promise(r => {
          const uuid = getUUID();
  
          echo.once(uuid, data => {
            r(data);
          })
  
          sendSocket('set_restart', {}, uuid)
        })
      },
      /**
       * @description 清理缓存
       */
      cleanCache: () => {
        return new Promise(r => {
          const uuid = getUUID();
  
          echo.once(uuid, data => {
            r(data);
          })
  
          sendSocket('clean_cache', {}, uuid)
        })
      }
    },
    /**
     * @description 直接发送socket
     * @param action 动作
     * @param params 参数
     */
    raw: (action: string, params: any) => {
      return new Promise(r => {
        const uuid = getUUID();
  
        echo.once(uuid, data => {
          r(data);
        })
  
        sendSocket(action, params, uuid);
      })
    }
  }
};

export const commander = {
  /**
   * @description 注册命令
   * @param command 命令
   * @param func 函数
   */
  reg: (command: Command, func: Function) => {
    if(command.group){
      // 群聊
      cmd.group.push(command.helper);
      
      bot.on('group_message', (e) => {
        const msg = e.raw_message;
        const sender = e.sender.user_id;
        const group = e.group_id;

        command.cmd.lastIndex = 0;
        if(command.cmd.test(msg)){
          command.cmd.lastIndex = 0;
          const m = command.cmd.exec(msg);
          
          const reply = (msg: string, auto_escape: boolean) => {
            api.socket.message.sendGroupMessage(group, msg, auto_escape);
          }

          if(!command.owner_require && !command.globalAdmin_require && !command.groupAdmin_require){
            // 不需要任何权限
            logger.info(`${sender} 在群聊(${group})中触发了 ${app.packagename} 的 ${command.cmd} 命令 (${msg})`)
            func(m, e, reply);
          }else{
            let allow = false;
            if(command.owner_require && admin.isOwner(sender)) allow = true;
            if(command.globalAdmin_require && (admin.isGlobalAdmin(sender) || admin.isOwner(sender))) allow = true;
            if(command.groupAdmin_require && (admin.isGroupAdmin(sender, group) || admin.isGlobalAdmin(sender) || admin.isOwner(sender))) allow = true;

            if(allow){
              logger.info(`${sender} 在群聊(${group})中触发了 ${app.packagename} 的 ${command.cmd} 命令 (${msg})`)
              func(m, e, reply);
            }
          }
        }
      })
    }

    if(command.private){
      // 私聊
      cmd.private.push(command.helper);
      
      bot.on('private_message', (e) => {
        const sender = e.sender.user_id;
        const msg = e.raw_message;

        command.cmd.lastIndex = 0;
        if(command.cmd.test(msg)){
          command.cmd.lastIndex = 0;
          const m = command.cmd.exec(msg);
          
          const reply = (msg: string, auto_escape?: boolean) => {
            api.socket.message.sendPrivateMsg(sender, msg, auto_escape);
          }

          if(!command.owner_require && !command.globalAdmin_require){
            // 不需要任何权限
            logger.info(`${sender} 在私聊中触发了 ${app.packagename} 的 ${command.cmd} 命令 (${msg})`)
            func(m, e, reply);
          }else{
            let allow = false;
            if(command.owner_require && admin.isOwner(sender)) allow = true;
            if(command.globalAdmin_require && (admin.isGlobalAdmin(sender) || admin.isOwner(sender))) allow = true;

            if(allow){
              logger.info(`${sender} 在私聊中触发了 ${app.packagename} 的 ${command.cmd} 命令 (${msg})`)
              func(m, e, reply);
            }
          }
        }
      })
    }
  }
}

export const logger = {
  debug: (msg: string) => sendLog('debug', msg),
  info: (msg: string) => sendLog('info', msg),
  warn: (msg: string) => sendLog('warn', msg),
  error: (msg: string) => sendLog('error', msg),
  fatal: (msg: string) => sendLog('fatal', msg),
}

///@ts-ignore
export const config = JSON.parse(process.env.config);
///@ts-ignore
export const app:App = JSON.parse(process.env.process);

// 注册help命令
commander.reg({
  cmd: new RegExp(`^.help ${app.packagename.replace('.', '\\.')}`),
  helper: `.help ${app.packagename}   查看帮助信息`,
  private: true,
  group: true,
  globalAdmin_require: false,
  groupAdmin_require: false,
  owner_require: false
}, (m: Array<string>, e: any, reply: Function) => {
  if(e.group_id){
    // 群聊
    reply(cmd.group.join('\n'), true);
  }else{
    // 私聊
    reply(cmd.private.join('\n'), true);
  }
})

const send = (msg: any, handle?: any) => {
  if(process.send) return process.send(msg, handle);
}

// 机器人socket
const sendSocket = (action: string, params: any, echo?: string) => {
  return send({
    type: 'socket',
    data: JSON.stringify({
      action: action,
      params: params,
      echo: echo
    })
  })
}

// 日志
const sendLog = (type: ('debug'|'info'|'warn'|'error'|'fatal'), msg: string) => {
  return send({
    type: 'log',
    log_type: type,
    message: msg
  })
}

process.on('message', (msg: ProcessMessage) => {
  switch(msg.type){
    case 'event':
      // 插件事件
      event.emit(msg.event_type);
      break;
    case 'bot_message':
      // 机器人消息
      bot.emit(msg.message_type, msg.data);
      break;
    case 'group_update':
      group_stat[msg.data.group] = msg.data.stats;
      break;
    case 'echo':
      const uuid: string = msg.uuid;
      const data: string = msg.data;
      echo.emit(uuid, data);
      break;
  }
})