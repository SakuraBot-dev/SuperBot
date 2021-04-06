import logger from '../core/logger'
import OneBot, { Config as OneBotConfig } from './OneBot'
import Telegram from './telegram'

interface Config {
  telegram: {
    enable: boolean
    token: string
  },
  OneBot: OneBotConfig
}

export default class Bot {
  private config: Config
  public Bots: {
    telegram: Telegram | null,
    OneBot: OneBot | null
  }

  constructor (config: Config) {
    logger('Core').info('正在启动...')
    this.config = config
    this.Bots = {
      telegram: null,
      OneBot: null
    }
    if (config.telegram.enable) this.telegram()
    if (config.OneBot.enable) this.OneBot()
  }

  private OneBot () {
    logger('Core').info('正在启动OneBot...')
    if (this.config.OneBot) this.Bots.OneBot = new OneBot(this.config.OneBot)
    logger('Core').info('OneBot启动完成')
  }

  private telegram () {
    logger('Core').info('正在启动Telegram...')
    if (this.config.telegram) this.Bots.telegram = new Telegram(this.config.telegram.token)
    logger('Core').info('Telegram启动完成')
  }
}
