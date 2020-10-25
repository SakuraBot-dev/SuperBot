import plugin from "./lib/core/plugin/index";
import { socket as SocketEvent } from "./lib/core/bot/event";
import logger from "./lib/core/logger";
import socket from './lib/core/bot/socket';
import fs from 'fs';
import path from 'path';
import bot from "./lib/core/bot/bot";

logger('MAIN').info('正在启动...');

try{
  fs.mkdirSync(path.join(__dirname, './data'));
  fs.mkdirSync(path.join(__dirname, './plugins'));
}catch(e) {
  // fail
}

socket();
bot()

SocketEvent.once('connect', () => {
  logger('MAIN').info('WebSocket连接成功，正在加载插件');
  plugin();
});