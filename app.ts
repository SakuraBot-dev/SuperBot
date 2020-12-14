import plugin from "./lib/core/plugin/index";
import { socket as SocketEvent } from "./lib/core/bot/event";
import logger from "./lib/core/logger";
import socket from './lib/core/bot/socket';
import fs from 'fs';
import path from 'path';
import bot from './lib/core/bot/bot';
import config from './config';
import { app as webui } from './lib/webui';

logger('MAIN').info('正在启动...');

if(config.webui.enable) webui.listen(config.webui.port, config.webui.hostname, () => { logger('WebUI').info(`Started at ${config.webui.hostname}:${config.webui.port}`) });

try{
  fs.mkdirSync(path.join(__dirname, './data'));
  fs.mkdirSync(path.join(__dirname, './plugins'));
}catch(e) {
  // fail
}

// 连接WebSocket
socket();
// 启动Bot
bot();

SocketEvent.once('connect', () => {
  logger('MAIN').info('WebSocket连接成功，正在加载插件');
  plugin();
});