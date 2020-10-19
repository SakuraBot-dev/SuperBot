import plugin from "./lib/core/plugin/index";
import { socket as SocketEvent } from "./lib/core/bot/event";
import logger from "./lib/core/logger";
import socket from './lib/core/bot/socket';
import fs from 'fs';

logger('MAIN').info('正在启动...');

if(fs.existsSync('./data')) {
  try{
    fs.mkdirSync('./data')
  }catch(e) {
    // fail
  }
};

if(fs.existsSync('./plugins')) {
  try{
    fs.mkdirSync('./plugins')
  }catch(e) {
    // fail
  }
};

socket();

SocketEvent.once('connect', () => {
  logger('MAIN').info('WebSocket连接成功，正在加载插件');
  plugin();
});