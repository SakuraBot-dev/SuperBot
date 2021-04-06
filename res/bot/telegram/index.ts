import EventEmitter from 'events'
import { Telegraf } from 'telegraf'

export default class Telegram {
  public bot: Telegraf
  public event: EventEmitter

  constructor (token: string) {
    this.bot = new Telegraf(token)
    this.event = new EventEmitter()

    this.bot.launch()

    const eventList: any[] = [
      'voice',
      'video_note',
      'video',
      'animation',
      'venue',
      'text',
      'supergroup_chat_created',
      'successful_payment',
      'sticker',
      'pinned_message',
      'photo',
      'new_chat_title',
      'new_chat_photo',
      'new_chat_members',
      'migrate_to_chat_id',
      'migrate_from_chat_id',
      'location',
      'left_chat_member',
      'invoice',
      'group_chat_created',
      'game',
      'dice',
      'document',
      'delete_chat_photo',
      'contact',
      'channel_chat_created',
      'audio',
      'poll'
    ]

    eventList.forEach(event => {
      this.bot.on(event, (...args) => {
        this.event.emit(event, ...args)
      })
    })
  }
}
