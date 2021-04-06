import { EventEmitter } from 'events'

export interface Data {
  time: number,
  // eslint-disable-next-line camelcase
  self_id: number,
  // eslint-disable-next-line camelcase
  post_type: string
}

/** 聊天消息 **/

export interface Anonymous{
  id: number,
  name: string,
  flag: string
}

export interface MessageNode {
  type: string,
  data: (null | {
    text?: string,
    id?: (string | number),
    file?: string,
    qq?: string,
    type?: (string | number),
    url?: string,
    title?: string,
    lat?: number,
    lon?: number,
    audio?: string,
    // eslint-disable-next-line camelcase
    user_id?: number,
    nickname?: string,
    content?: (string | MessageNode),
    data?: string
  })
}

export interface Sender {
  // eslint-disable-next-line camelcase
  user_id: number,
  nickname: string,
  sex?: string,
  age?: number,
  card?: string,
  area?: string,
  level?: string,
  role?: string,
  title?: string
}

export interface Message extends Data{
  // eslint-disable-next-line camelcase
  message_type: ('private' | 'group'),
  // eslint-disable-next-line camelcase
  sub_type: string,
  // eslint-disable-next-line camelcase
  message_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  message: (string | MessageNode[]),
  // eslint-disable-next-line camelcase
  raw_message: string,
  font: number,
  sender: Sender,
  // eslint-disable-next-line camelcase
  group_id: number,
  anonymous: (null | Anonymous)
}

export interface GroupMessage{
  // eslint-disable-next-line camelcase
  raw_message: string,
  message: (string | MessageNode[]),
  // eslint-disable-next-line camelcase
  message_id: number,
  // eslint-disable-next-line camelcase
  group_id: number,
  sender: Sender,
  anonymous: (null | Anonymous),
  font: number,
  // eslint-disable-next-line camelcase
  self_id: number
}

export interface PrivateMessage {
  // eslint-disable-next-line camelcase
  raw_message: string,
  message: (string | MessageNode[]),
  // eslint-disable-next-line camelcase
  message_id: number,
  sender: Sender,
  font: number,
  // eslint-disable-next-line camelcase
  self_id: number
}

/** 通知消息 **/

export interface NoticeFile {
  id: string,
  name: string,
  size: number,
  busid: number
}

export interface Notice extends Data {
  // eslint-disable-next-line camelcase
  notice_type: string,
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  file: NoticeFile,
  // eslint-disable-next-line camelcase
  sub_type: string,
  // eslint-disable-next-line camelcase
  operator_id: number,
  duration: number,
  // eslint-disable-next-line camelcase
  message_id: number,
  // eslint-disable-next-line camelcase
  target_id: number,
  // eslint-disable-next-line camelcase
  honor_type: ('talkative'|'performer'|'emotion')
}

export interface GroupFileUpload {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  file: NoticeFile
}

export interface GroupAdminChange {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  type: string
}

export interface GroupMemberChange {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  type: string,
  operator: number
}

export interface GroupMute {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  type: string,
  operator: number,
  duration: number
}

export interface FriendAdd {
  // eslint-disable-next-line camelcase
  user_id: number
}

export interface GroupRecall {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  operator: number,
  // eslint-disable-next-line camelcase
  message_id: number
}

export interface FriendRecall {
  // eslint-disable-next-line camelcase
  user_id: number,
  // eslint-disable-next-line camelcase
  message_id: number
}

export interface GroupPoke {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  // eslint-disable-next-line camelcase
  target_id: number
}

export interface LuckyKing {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  // eslint-disable-next-line camelcase
  target_id: number
}

export interface GroupHonor {
  // eslint-disable-next-line camelcase
  group_id: number,
  // eslint-disable-next-line camelcase
  user_id: number,
  type: string
}

/** Meta消息 **/

export interface heartbeat {
  // eslint-disable-next-line camelcase
  self_id: number,
  status: any,
  time: number,
  interval: number
}

/** 请求消息 **/

export interface Request extends Data{
  // eslint-disable-next-line camelcase
  request_type: string,
  // eslint-disable-next-line camelcase
  user_id: number,
  // eslint-disable-next-line camelcase
  group_id: number,
  comment: string,
  // eslint-disable-next-line camelcase
  sub_type: string,
  flag: string,
}

export interface FriendRequest {
  // eslint-disable-next-line camelcase
  user_id: number,
  comment: string,
  flag: string,
}

export interface GroupRequest {
  // eslint-disable-next-line camelcase
  user_id: number,
  // eslint-disable-next-line camelcase
  group_id: number,
  comment: string,
  type: string,
  flag: string,
}

export interface Meta {
  // eslint-disable-next-line camelcase
  _post_method?: number,
  interval?: number,
  status?: any
  // eslint-disable-next-line camelcase
  meta_event_type: string,
  // eslint-disable-next-line camelcase
  post_type: string,
  // eslint-disable-next-line camelcase
  self_id: number,
  // eslint-disable-next-line camelcase
  sub_type: string,
  time: number
}

/** Event **/

export interface BotEvent extends EventEmitter {
  emit(event: 'open'): any
  emit(event: 'close'): any
  emit(event: 'reopen'): any
  emit(event: 'connect'): any
  emit(event: 'error', msg: any): any
  emit(event: 'group_message', msg: GroupMessage): any
  emit(event: 'private_message', msg: PrivateMessage): any
  emit(event: 'group_file_upload', msg: GroupFileUpload): any
  emit(event: 'group_admin_change', msg: GroupAdminChange): any
  emit(event: 'group_decrease', msg: GroupMemberChange): any
  emit(event: 'group_increase', msg: GroupMemberChange): any
  emit(event: 'group_mute', msg: GroupMute): any
  emit(event: 'friend_add', msg: FriendAdd): any
  emit(event: 'group_recall', msg: GroupRecall): any
  emit(event: 'friend_recall', msg: FriendRecall): any
  emit(event: 'poke', msg: GroupPoke): any
  emit(event: 'lucky_king', msg: LuckyKing): any
  emit(event: 'honor', msg: GroupHonor): any
  emit(event: 'friend_request', msg: FriendRequest): any
  emit(event: 'group_request', msg: GroupRequest): any
  emit(event: 'echo', msg: any): any

  on(event: 'group_message', listener: (msg: GroupMessage) => void): any
  on(event: 'private_message', listener: (msg: PrivateMessage) => void): any
  on(event: 'group_file_upload', listener: (msg: GroupFileUpload) => void): any
  on(event: 'group_admin_change', listener: (msg: GroupAdminChange) => void): any
  on(event: 'group_decrease', listener: (msg: GroupMemberChange) => void): any
  on(event: 'group_increase', listener: (msg: GroupMemberChange) => void): any
  on(event: 'group_mute', listener: (msg: GroupMute) => void): any
  on(event: 'friend_add', listener: (msg: FriendAdd) => void): any
  on(event: 'group_recall', listener: (msg: GroupRecall) => void): any
  on(event: 'friend_recall', listener: (msg: FriendRecall) => void): any
  on(event: 'poke', listener: (msg: GroupPoke) => void): any
  on(event: 'lucky_king', listener: (msg: LuckyKing) => void): any
  on(event: 'honor', listener: (msg: GroupHonor) => void): any
  on(event: 'friend_request', listener: (msg: FriendRequest) => void): any
  on(event: 'group_request', listener: (msg: GroupRequest) => void): any
  on(event: 'echo', listener: (msg: any) => void): any

  addListener(event: 'group_message', listener: (msg: GroupMessage) => void): this;
  addListener(event: 'private_message', listener: (msg: PrivateMessage) => void): this;
  addListener(event: 'group_file_upload', listener: (msg: GroupFileUpload) => void): this;
  addListener(event: 'group_admin_change', listener: (msg: GroupAdminChange) => void): this;
  addListener(event: 'group_decrease', listener: (msg: GroupMemberChange) => void): this;
  addListener(event: 'group_increase', listener: (msg: GroupMemberChange) => void): this;
  addListener(event: 'group_mute', listener: (msg: GroupMute) => void): this;
  addListener(event: 'friend_add', listener: (msg: FriendAdd) => void): this;
  addListener(event: 'group_recall', listener: (msg: GroupRecall) => void): this;
  addListener(event: 'friend_recall', listener: (msg: FriendRecall) => void): this;
  addListener(event: 'poke', listener: (msg: GroupPoke) => void): this;
  addListener(event: 'lucky_king', listener: (msg: LuckyKing) => void): this;
  addListener(event: 'honor', listener: (msg: GroupHonor) => void): this;
  addListener(event: 'friend_request', listener: (msg: FriendRequest) => void): this;
  addListener(event: 'group_request', listener: (msg: GroupRequest) => void): this;
  addListener(event: 'echo', listener: (msg: any) => void): this;

  removeAllListeners(event: 'group_message'): any
  removeAllListeners(event: 'private_message'): any
  removeAllListeners(event: 'group_file_upload'): any
  removeAllListeners(event: 'group_admin_change'): any
  removeAllListeners(event: 'group_decrease'): any
  removeAllListeners(event: 'group_increase'): any
  removeAllListeners(event: 'group_mute'): any
  removeAllListeners(event: 'friend_add'): any
  removeAllListeners(event: 'group_recall'): any
  removeAllListeners(event: 'friend_recall'): any
  removeAllListeners(event: 'poke'): any
  removeAllListeners(event: 'lucky_king'): any
  removeAllListeners(event: 'honor'): any
  removeAllListeners(event: 'friend_request'): any
  removeAllListeners(event: 'group_request'): any
  removeAllListeners(event: 'echo'): any
}
