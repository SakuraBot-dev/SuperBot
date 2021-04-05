import OneBot, { Config as OneBotConfig } from './OneBot'
import Telegram from './telegram'

interface Config {
  telegram?: {
    token: string
  },
  OneBot?: OneBotConfig
}

export default class Bot {
  private config: Config
  private Bots: {
    telegram: Telegram | null,
    OneBot: OneBot | null
  }

  constructor (config: Config) {
    this.config = config
    this.Bots = {
      telegram: null,
      OneBot: null
    }
    if (config.telegram) this.telegram()
    if (config.OneBot) this.OneBot()
  }

  private OneBot () {
    if (this.config.OneBot) this.Bots.OneBot = new OneBot(this.config.OneBot)
  }

  private telegram () {
    if (this.config.telegram) this.Bots.telegram = new Telegram(this.config.telegram.token)
  }
}
