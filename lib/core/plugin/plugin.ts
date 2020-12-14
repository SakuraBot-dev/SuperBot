import child_process from 'child_process';
import path from 'path';
import fs from 'fs';
import config from '../../../config';
import logger from '../logger';
import { bot as BotEvent, BotEventList, socket as SocketEvent, echo as EchoEvent } from '../bot/event';

interface Map {
  [key: string]: any;
  [index: number]: any;
}

interface Package {
  main: string,
  name: string,
  packagename: string,
  version: string,
  options: object | null
}

export default class {
  root: string
  package: Package
  main: string
  options: any
  in: child_process.ChildProcess | undefined
  config: Map
  allow_exit: boolean
  restart: boolean
  groupStat: Map
  first: boolean

  constructor(dir: string) {
    this.root = path.join(__dirname, '../../../plugins/', dir);
    this.allow_exit = false;
    this.restart = false;
    this.groupStat = {};
    this.first = true;

    this.package = JSON.parse(fs.readFileSync(path.join(this.root, 'package.json')).toString());
    this.main = path.join(this.root, this.package.main);
    this.options = this.package.options;
    this.config = config.plugins[this.package.packagename] || {};
  }

  /**
   * @name 加载插件
   */
  load () {
    if(!this.in){
      this.package = JSON.parse(fs.readFileSync(path.join(this.root, 'package.json')).toString());
      this.main = path.join(this.root, this.package.main);
      this.options = this.package.options || {};
      this.config = config.plugins[this.package.packagename] || {};
      this.allow_exit = false;
      this.groupStat = {};

      if(!this.options.env) this.options.env = {};
      const p = {
        root: this.root,
        data: path.join(__dirname, '../../../data/', this.package.packagename),
        appRoot: path.join(__dirname, '../../../'),
        restart: this.restart,
        packagename: this.package.packagename
      }

      // 创建数据文件夹
      try{
        fs.mkdirSync(p.data);
      }catch(e) {}
      
      this.options.env = Object.assign(this.options.env, { config: JSON.stringify(this.config), process: JSON.stringify(p) });

      logger(this.package.packagename).debug(this.options);

      this.in = child_process.fork(this.main, this.options);
      if(this.first) this.bind();
      
      this.first = false;
      
      this.in.on('message', (msg) => {
        this.onmessage(msg);
      })

      this.in.on('exit', (code, sign) => {
        this.in = undefined;
        
        if(this.allow_exit) return;

        if(code === 0){
          logger(this.package.packagename).warn(`插件进程退出, code:`, code, ', sign:', sign);
        }else{
          logger(this.package.packagename).error(`插件进程退出, code:`, code, ', sign:', sign);
        }

        this.restart = true;
        this.load();
      })

      this.emit('load', null);

      if(this.restart){
        logger(this.package.packagename).info('插件重启成功');
      }else{
        logger(this.package.packagename).info('插件启动成功');
      }
    }else{
      logger(this.package.packagename).warn('插件已经启动了');
    }
  }

  /**
   * @name 卸载插件
   */
  unload () {
    return new Promise(r => {
      if(this.in){
        this.allow_exit = true;
        this.emit('unload', null);
        this.in.once('exit', () => { r('卸载成功'); })
        setTimeout(() => {
          if(this.in) this.in.kill('SIGKILL');
          this.in = undefined;
          r('卸载成功');
        }, 5e3);
      }else{
        r('插件没有运行')
        logger(this.package.packagename).warn('插件没有运行');
      }
    })
  }

  /**
   * @name 在指定群中禁用插件
   * */
  disable (group: number) {
    this.emit('disable', group);
  }

  /**
   * @name 在指定群中启用插件
   * */
  enable (group: number) {
    this.emit('enable', group);
  }

  /**
   * @name 设置群状态
   * @param group 群号
   * @param stat 状态
   */
  setGroup (group: number, stat: boolean) {
    this.groupStat[group] = stat;
    if(this.in){
      this.in.send({
        type: 'group_update',
        data: {
          group: group,
          stats: stat
        }
      })
    }
  }

  /**
   * @name 绑定事件
   */
  private bind () {
    if(this.in){
      BotEventList.forEach((e:any) => {
        logger(this.package.packagename).debug('正在绑定', e, '事件...');
        if(e === 'group_message'){
          BotEvent.on(e, (data) => {
            if(this.groupStat[data.group_id] === undefined) this.groupStat[data.group_id] = true;
            if(!this.groupStat[data.group_id]) return;

            this.botEvent(e, data);
          })
        }else{
          BotEvent.on(e, (data) => {
            this.botEvent(e, data);
          })

          EchoEvent.on('echo', ({uuid, data}) => {
            this.echoEvent(uuid, data);
          })
        }
        logger(this.package.packagename).debug(e, '绑定完成');
      })
    }
  }

  private onmessage (msg: any) {
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
  private botEvent (type: string, data: any) {
    try{
      if(!this.in) return;
      this.in.send({
        type: 'bot_message',
        message_type: type,
        data: data
      })
    }catch(e) {}
  }

  /**
   * @name echo事件
   * @param uuid uuid
   * @param data 返回内容
   */
  private echoEvent (uuid: string, data: any) {
    try{
      if(!this.in) return;
      this.in.send({
        type: 'echo',
        uuid: uuid,
        data: data
      })
    }catch(e) {}
  }

  /**
   * @name 事件
   * @param type 事件类型
   * @param data 事件数据
   */
  private emit (type: string, data: any) {
    try{
      if(!this.in) return;
      this.in.send({
        type: 'event',
        event_type: type,
        data: data
      })
    }catch(e) {}
  }
}