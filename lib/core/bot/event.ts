import { EventEmitter } from "events";
import {
  SocketEvent,
  BotEvent,
  MetaEvent
} from './Message';

export const socket: SocketEvent = new EventEmitter();
export const bot: BotEvent = new EventEmitter();
export const meta: MetaEvent = new EventEmitter();
export const echo: EventEmitter = new EventEmitter();

socket.setMaxListeners(Number.MAX_SAFE_INTEGER);
bot.setMaxListeners(Number.MAX_SAFE_INTEGER);
meta.setMaxListeners(Number.MAX_SAFE_INTEGER);
echo.setMaxListeners(Number.MAX_SAFE_INTEGER);

export const BotEventList = [
  'group_message',
  'private_message',
  'group_file_upload',
  'group_admin_change',
  'group_decrease',
  'group_increase',
  'group_mute',
  'friend_add',
  'group_recall',
  'friend_recall',
  'poke',
  'lucky_king',
  'honor',
  'friend_request',
  'group_request'
];