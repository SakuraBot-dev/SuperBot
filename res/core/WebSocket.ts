import WS from 'ws'
import { EventEmitter } from 'events'

export default class WebSocket extends EventEmitter {
  private socket: WS
  private url: string

  constructor (url: string) {
    super()
    this.url = url
    this.init()
  }

  init () {
    this.socket = new WS(this.url)

    this.socket.on('open', () => this.emit('connect'))
    this.socket.on('message', msg => this.emit('message', msg))
    this.socket.on('error', err => this.emit('error', err))
    this.socket.on('close', () => {
      this.handleClose()
    })
  }

  handleClose () {
    this.emit('close')
    setTimeout(() => {
      try {
        this.socket.close()
      } catch (error) { }
      this.init()
      this.emit('reconnect')
    }, 3e3)
  }
}
