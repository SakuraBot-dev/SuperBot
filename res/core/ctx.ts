import { Logger } from 'log4js'
import OneBot from '../bot/OneBot'
import telegram from '../bot/telegram'
import logger from './logger'
import bot from './robot'
import config from '../../config'

export const commands: {cmd: string, helper: string}[] = []
export interface ctx {
  config: any,
  telegram: telegram,
  OneBot: OneBot,
  logger: Logger,
  path: string,
  command: (regexp: RegExp, cmd: string, helper: string, callback: (match: RegExpExecArray | null, source: 'telegram' | 'OneBot', message: any, reply: (msg: any, options?: boolean | any) => void) => void) => void
}

export default {
  config: config,
  telegram: bot.Bots.telegram ? bot.Bots.telegram : null,
  OneBot: bot.Bots.OneBot ? bot.Bots.OneBot : null,
  command: (regexp: RegExp, cmd: string, helper: string, callback: (match: RegExpExecArray | null, source: 'telegram' | 'OneBot', message: any, reply: (msg: any, options?: boolean | any) => void) => void) => {
    logger('Command').debug('正在注册', cmd, '命令, RegExp:', regexp)
    commands.push({ cmd, helper })

    if (bot.Bots.telegram) {
      const tg = bot.Bots.telegram

      // Telegram 消息
      tg.event.on('text', (ctx) => {
        // @ts-ignore
        const reply = (msg: string, options?: any) => {
          ctx.telegram.sendMessage(ctx.message.chat.id, msg, options)
        }

        // @ts-ignore
        const m: string = ctx.message.text
        regexp.lastIndex = 0
        if (regexp.test(m)) {
          regexp.lastIndex = 0
          logger('Command').info(ctx.message.chat.id, ' 在 Telegram 触发了 ', cmd, ' 命令')
          callback(regexp.exec(m), 'telegram', ctx, reply)
        }
      })
      logger('Command').debug('在Telegram中注册了', cmd, '命令, RegExp:', regexp)
    }

    if (bot.Bots.OneBot) {
      const OneBot = bot.Bots.OneBot

      // 私聊消息
      OneBot.event.on('group_message', msg => {
        const reply = (message: string, autoEscape: boolean) => {
          OneBot.sendGroupMessage(msg.group_id, message)
        }

        const m: string = msg.raw_message
        regexp.lastIndex = 0
        if (regexp.test(m)) {
          logger('Command').info(msg.sender.nickname, ' 在 OneBot群聊 触发了 ', cmd, ' 命令')
          callback(regexp.exec(m), 'OneBot', msg, reply)
        }
      })

      // 群聊消息
      OneBot.event.on('private_message', msg => {
        const reply = (message: string) => {
          OneBot.sendPrivateMessage(msg.sender.user_id, message)
        }

        const m: string = msg.raw_message
        regexp.lastIndex = 0
        if (regexp.test(m)) {
          logger('Command').info(msg.sender.nickname, ' 在 OneBot私聊 触发了 ', cmd, ' 命令')
          callback(regexp.exec(m), 'OneBot', msg, reply)
        }
      })
      logger('Command').debug('在OneBot中注册了', cmd, '命令, RegExp:', regexp)
    }
    logger('Command').debug(cmd, '命令注册完成')
  }
}
