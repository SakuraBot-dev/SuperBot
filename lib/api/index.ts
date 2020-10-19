import { EventEmitter } from 'events';
import {
  BotEvent
} from '../core/bot/Message';

interface ProcessMessage {
  type: 'event' | 'bot_message',
  event_type?: any,
  message_type?: any,
  data: any
}

interface event {
  on(event: 'load', listener: () => void): any
  on(event: 'unload', listener: () => void): any
  
  emit(event: 'load'): any
  emit(event: 'unload'): any
  
  addListener(event: 'load', listener: () => void): any
  addListener(event: 'unload', listener: () => void): any
  
  removeAllListeners(event: 'load'): any
  removeAllListeners(event: 'unload'): any

  once(event: 'load', listener: () => void): any
  once(event: 'unload', listener: () => void): any
}

export const bot: BotEvent = new EventEmitter();
export const event: event = new EventEmitter();

export const api = {
  
}

process.on('message', (msg: ProcessMessage) => {
  switch(msg.type){
    case 'event':
      bot.emit(msg.event_type, msg.data);
      break;
    case 'bot_message':
      bot.emit(msg.event_type, msg.data);
      break;
  }
})