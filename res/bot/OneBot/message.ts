export default class Message {
  private message: Array<any>
  constructor () {
    this.message = []
    return this
  }

  getMsg () {
    return this.message.join('')
  }

  warp () {
    this.message.push('\n')
    return this
  }

  text (text: string) {
    this.message.push(text)
    return this
  }

  image ({ url, type, timeout }: { url: string, type?: 'flash', timeout?: number}) {
    this.message.push(`[CQ:image,url=${url}${type ? ',type=flash' : ''}${timeout ? `,timeout=${timeout}` : ''}]`)
    return this
  }

  face (id: number) {
    this.message.push(`[CQ:face,id=${id}]`)
    return this
  }

  record ({ url, magic, timeout }: { url: string, magic?: 1 | 0, timeout?: number }) {
    this.message.push(`[CQ:record,url=${url}${timeout ? `,timeout=${timeout}` : ''}${magic ? `,magic=${magic}` : ''}]`)
    return this
  }

  video ({ url, timeout }: { url: string, timeout?: number }) {
    this.message.push(`[CQ:video,url=${url}${timeout ? `,timeout=${timeout}` : ''}]`)
    return this
  }

  at (qq: number) {
    this.message.push(`[CQ:at,qq=${qq}]`)
    return this
  }

  rps () {
    this.message.push('[CQ:rps]')
    return this
  }

  shake () {
    this.message.push('[CQ:shake]')
    return this
  }

  poke (type: number = 1, id: number = -1) {
    this.message.push(`[CQ:poke,type=${type},id=${id}]`)
    return this
  }

  share (url: string, title: string) {
    this.message.push(`[CQ:share,url=${url},title=${title}]`)
    return this
  }

  contact (type: 'group' | 'qq', id: number) {
    this.message.push(`[CQ:contact,type=${type},id=${id}]`)
    return this
  }

  location (lat: number, lon: number) {
    this.message.push(`[CQ:location,lat=${lat},lon=${lon}]`)
    return this
  }

  music ({ type, id, url, audio, title }: { type: 'qq' | '163' | 'xm' | 'custom', id?: number, url?: string, audio?: string, title?: string }) {
    if (type === 'custom') {
      this.message.push(`[CQ:music,type=custom,url=${url},audio=${audio},title=${title}]`)
    } else {
      this.message.push(`[CQ:music,type=${type},id=${id}]`)
    }
    return this
  }

  reply (id: number) {
    this.message.push(`[CQ:reply,id=${id}]`)
    return this
  }

  forward (id: string) {
    this.message.push(`[CQ:forward,id=${id}]`)
    return this
  }

  node (id: string) {
    this.message.push(`[CQ:node,id=${id}]`)
    return this
  }

  xml (xml: string) {
    this.message.push(`[CQ:xml,data=${xml}]`)
    return this
  }

  json (json: object) {
    this.message.push(`[CQ:json,data=${JSON.stringify(json)}]`)
    return this
  }
}
