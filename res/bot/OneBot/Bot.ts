import WebSocket from '../../core/WebSocket'
import { EventEmitter } from 'events'
import {
  BotEvent
} from './types'

export interface Config {
  enable: boolean,
  host: string,
  port: number,
  accessToken: string
}

export default class OneBot {
  public socket: WebSocket
  public event: BotEvent

  constructor (config: Config) {
    // @ts-ignore
    this.event = new EventEmitter()

    this.socket = new WebSocket(`ws://${config.host}:${config.port}/?access_token=${config.accessToken}`)
    this.socket.on('open', () => this.event.emit('open'))
    this.socket.on('error', err => this.event.emit('error', err))
    this.socket.on('close', () => this.event.emit('close'))
    this.socket.on('reconnect', () => this.event.emit('reopen'))
    this.socket.on('message', msg => {
      this.handleMessage(msg)
    })
  }

  handleMessage (data: string) {
    const msg = JSON.parse(data)
    if (msg.echo) {
      this.event.emit('echo', msg)
    } else if (msg.post_type === 'message') {
      switch (msg.message_type) {
        case 'group':
          this.event.emit('group_message', msg)
          break
        case 'private':
          this.event.emit('private_message', msg)
          break
        default:
          break
      }
    } else if (msg.post_type === 'notice') {
      switch (msg.notice_type) {
        case 'group_upload':
          this.event.emit('group_file_upload', msg)
          break
        case 'group_admin':
          this.event.emit('group_admin_change', msg)
          break
        case 'group_decrease':
          this.event.emit('group_decrease', msg)
          break
        case 'group_increase':
          this.event.emit('group_increase', msg)
          break
        case 'group_ban':
          this.event.emit('group_mute', msg)
          break
        case 'friend_add':
          this.event.emit('friend_add', msg)
          break
        case 'group_recall':
          this.event.emit('group_recall', msg)
          break
        case 'friend_recall':
          this.event.emit('friend_recall', msg)
          break
        case 'notify':
          switch (msg.sub_type) {
            case 'poke':
              this.event.emit('poke', msg)
              break
            case 'lucky_king':
              this.event.emit('lucky_king', msg)
              break
            case 'honor':
              this.event.emit('honor', msg)
              break
            default:
              break
          }
          break
        default:
          break
      }
    } else if (msg.post_type === 'request') {
      switch (msg.request_type) {
        case 'friend':
          this.event.emit('friend_request', msg)
          break
        case 'request':
          this.event.emit('group_request', msg)
          break
        default:
          break
      }
    } else if (msg.post_type === 'meta') {
      switch (msg.meta_event_type) {
        case 'lifecycle':
          if (msg.sub_type === 'connect') this.event.emit('connect')
          break
        case 'heartbeat':
          break
        default:
          break
      }
    }
  }
}
