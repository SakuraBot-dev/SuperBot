import WS from 'ws'
import { EventEmitter } from 'events'
import logger from './logger'

export default class WebSocket extends EventEmitter {
  // @ts-ignore
  private socket: WS
  private url: string

  constructor (url: string) {
    super()
    this.url = url
    this.init()
  }

  init () {
    try {
      this.socket = new WS(this.url)

      this.socket.on('open', () => this.emit('connect'))
      this.socket.on('message', (msg: any) => this.emit('message', msg))
      this.socket.on('error', (err: any) => this.emit('error', err))
      this.socket.on('close', () => {
        this.handleClose()
      })
      logger('WebSocket').info('WebSocket 连接成功')
    } catch (error) {
      logger('WebSocket').warn('WebSocket 连接失败, 正在准备重试...')
      setTimeout(() => {
        try {
          this.socket.close()
        } catch (error) { }
        this.init()
        this.emit('reconnect')
      }, 3e3)
    }
  }

  handleClose () {
    logger('WebSocket').warn('WebSocket 断开连接，正在重连...')
    this.emit('close')
    setTimeout(() => {
      try {
        this.socket.close()
      } catch (error) { }
      this.init()
      this.emit('reconnect')
    }, 3e3)
  }

  send (msg: any) {
    try {
      this.socket.send(JSON.stringify(msg))
      return null
    } catch (error) {
      return error
    }
  }
}
