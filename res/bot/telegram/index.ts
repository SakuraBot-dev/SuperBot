import TG from 'node-telegram-bot-api'

export default class Telegram {
  public bot: TG
  public command: (regex: RegExp, callback: (msg: string, match: RegExpMatchArray) => void) => void

  constructor (token) {
    this.bot = new TG(token, { polling: true })
    this.command = this.bot.onText
  }
}
