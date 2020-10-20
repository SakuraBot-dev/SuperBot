import { EventEmitter } from "events";

export interface Data {
  time: number,
  self_id: number,
  post_type: string
}

/** 聊天消息 **/

export interface Message extends Data{
  message_type: ('private' | 'group'),
  sub_type: string,
  message_id: number,
  user_id: number,
  message: (string | MessageNode[]),
  raw_message: string,
  font: number,
  sender: Sender,
  group_id: number,
  anonymous: (null | Anonymous)
}

export interface MessageNode {
  type: string,
  data: ( null | {
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
    user_id?: number,
    nickname?: string,
    content?: (string | MessageNode),
    data?: string
  })
}

export interface Sender {
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

export interface Anonymous{
  id: number,
  name: string,
  flag: string
}

export interface GroupMessage{
  raw_message: string,
  message: (string | MessageNode[])
  group_id: number,
  sender: Sender,
  anonymous: (null | Anonymous),
  font: number,
  self_id: number
}

export interface PrivateMessage {
  raw_message: string,
  message: (string | MessageNode[])
  sender: Sender,
  font: number,
  self_id: number
}

/** 通知消息 **/

export interface Notice extends Data {
  notice_type: string,
  group_id: number,
  user_id: number,
  file: NoticeFile,
  sub_type: string,
  operator_id: number,
  duration: number,
  message_id: number,
  target_id: number,
  honor_type: ('talkative'|'performer'|'emotion')
}

export interface NoticeFile {
  id: string,
  name: string,
  size: number,
  busid: number
}

export interface GroupFileUpload {
  group_id: number,
  user_id: number,
  file: NoticeFile
}

export interface GroupAdminChange {
  group_id: number,
  user_id: number,
  type: string
}

export interface GroupMemberChange {
  group_id: number,
  user_id: number,
  type: string,
  operator: number
}

export interface GroupMute {
  group_id: number,
  user_id: number,
  type: string,
  operator: number,
  duration: number
}

export interface FriendAdd {
  user_id: number
}

export interface GroupRecall {
  group_id: number,
  user_id: number,
  operator: number,
  message_id: number
}

export interface FriendRecall {
  user_id: number,
  message_id: number
}

export interface GroupPoke {
  group_id: number,
  user_id: number,
  target_id: number
}

export interface LuckyKing {
  group_id: number,
  user_id: number,
  target_id: number
}

export interface GroupHonor {
  group_id: number,
  user_id: number,
  type: string
}

/** 请求消息 **/

export interface Request extends Data{
  request_type: string,
  user_id: number,
  group_id: number,
  comment: string,
  sub_type: string,
  flag: string,
}

export interface FriendRequest {
  user_id: number,
  comment: string,
  flag: string,
}

export interface GroupRequest {
  user_id: number,
  group_id: number,
  comment: string,
  type: string,
  flag: string,
}

/** Event **/

export interface SocketEvent extends EventEmitter{
  on(event: 'message', listener: (msg: object) => void): any
  on(event: 'connect', listener: () => void): any
  
  emit(event: 'message', msg: object): any
  emit(event: 'connect'): any
  
  addListener(event: 'message', listener: (msg: object) => void): any
  addListener(event: 'connect', listener: () => void): any
  
  removeAllListeners(event: 'message'): any
  removeAllListeners(event: 'connect'): any

  once(event: 'message', listener: (msg: object) => void): any
  once(event: 'connect', listener: () => void): any
}

export interface BotEvent extends EventEmitter {
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
}