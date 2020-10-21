import child_process from 'child_process';
import path from 'path';
import fs from 'fs';
import config from '../../../config';
import logger from '../logger';
import { bot as BotEvent, BotEventList, socket as SocketEvent } from '../bot/event';


interface Map {
  [key: string]: any;
  [index: number]: any;
}

interface Package {
  main: string,
  name: string,
  packagename: string,
  version: string,
  options: object | null,
  dependencies: Map
}

export default class {
  root: string
  id: number
  package: Package
  main: string
  options: any
  in: child_process.ChildProcess | undefined
  config: Map
  allow_exit: boolean
  restart: boolean
  groupStat: Map

  constructor(dir: string, id: number) {
    this.root = path.join(__dirname, '../../../plugins/', dir);
    this.id = id;
    this.allow_exit = false;
    this.restart = false;
    this.groupStat = {};
    
    this.package = JSON.parse(fs.readFileSync(path.join(this.root, 'package.json')).toString());
    this.main = path.join(this.root, this.package.main);
    this.options = this.package.options;
    this.config = config.plugins[this.package.packagename] || {};

    this.load();
  }

  /**
   * @name 加载插件
   */
  load () {
    if(!this.in){
      this.package = JSON.parse(fs.readFileSync(path.join(this.root, 'package.json')).toString());
      this.main = path.join(this.root, this.package.main);
      this.options = this.package.options;
      this.config = config.plugins[this.package.packagename] || {};
      this.allow_exit = false;

      if(!this.options.env) this.options.env = {};
      const p = {
        root: this.root,
        data: path.join(__dirname, '../../../data/', this.package.packagename),
        appRoot: path.join(__dirname, '../../../'),
        id: this.id,
        restart: this.restart
      }
      this.options.env = Object.assign(this.options.env, { config: JSON.stringify(this.config), process: JSON.stringify(p) });

      logger(this.package.packagename).debug(this.options);

      this.in = child_process.fork(this.main, this.options);
      this.bind();
      
      this.in.on('message', (msg) => {
        this.onmessage(msg);
      })

      this.in.on('exit', (code, sign) => {
        if(code === 0){
          logger(`Plugin`).warn(`插件进程退出, code:`, code, ', sign:', sign);
        }else{
          logger(`Plugin`).error(`插件进程退出, code:`, code, ', sign:', sign);
        }

        this.in = undefined;

        if(!this.allow_exit){
          // 重启
          this.restart = true;
          this.load();
        }
      })

      this.emit('load', null);

      if(this.restart){
        logger(`Plugin`).info('插件重启成功');
      }else{
        logger(`Plugin`).info('插件启动成功');
      }
    }else{
      logger(`Plugin`).warn('插件已经启动了');
    }
  }

  /**
   * @name 卸载插件
   */
  unload () {
    if(this.in){
      this.allow_exit = true;
      this.emit('unload', null);
      setTimeout(() => {
        if(this.in) this.in.kill('SIGKILL');
      }, 5e3);
    }else{
      logger(`Plugin`).warn('插件没有运行');
    }
  }

  /**
   * @name 设置群状态
   * @param group 群号
   * @param stat 状态
   */
  setGroup (group: number, stat: boolean) {
    this.groupStat[group] = stat;
  }

  /**
   * @name 绑定事件
   */
  bind () {
    if(this.in){
      BotEventList.forEach((e:any) => {
        logger(this.package.packagename).debug('正在绑定', e, '事件...');
        if(e === 'group_message'){
          BotEvent.on(e, (data) => {
            logger(this.package.packagename).debug(e, data);
            if(this.groupStat[data.group_id] === undefined) this.groupStat[data.group_id] = true;
            if(!this.groupStat[data.group_id]) return;

            this.botEvent(e, data);
          })
        }else{
          BotEvent.on(e, (data) => {
            logger(this.package.packagename).debug(e, data);
            this.botEvent(e, data);
          })
        }
        logger(this.package.packagename).debug(e, '绑定完成');
      })
    }
  }

  onmessage (msg: any) {
    if(!msg.type) return;
    switch(msg.type) {
      case 'socket':
        SocketEvent.emit('send', msg.data);
        break;
      case 'log':
        try {
          const log_type: ('debug'|'info'|'warn'|'error'|'fatal') = msg.log_type.toLowerCase();
          logger(this.package.packagename)[log_type](msg.message)
        } catch (error) {
          logger(this.package.packagename).warn('日志输出失败');
        }
        break;
      default:
        logger(this.package.packagename).warn(`未知的消息类型: ${msg.type}`);
    }
  }

  /**
   * @name Bot事件
   * @param type 事件类型
   * @param data 事件数据
   */
  botEvent (type: string, data: any) {
    if(this.in){
      this.in.send({
        type: 'bot_message',
        message_type: type,
        data: data
      })
    }
  }

  /**
   * @name 事件
   * @param type 事件类型
   * @param data 事件数据
   */
  emit (type: string, data: any) {
    if(this.in){
      this.in.send({
        type: 'event',
        event_type: type,
        data: data
      })
    }
  }
}