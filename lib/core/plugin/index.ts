import fs from 'fs';
import path from 'path';
import Plugin from './plugin';
import logger from '../logger';
import { bot as Bot } from '../bot/event';
import api from '../bot/api/http';
import admin from '../../admin';

const plugins: {
  [index: string]: Plugin
} = {};

const init = () => {
  fs.readdirSync(path.join(__dirname, '../../../plugins')).forEach(file => {
    const p = new Plugin(file);
    plugins[p.package.packagename] = p;
  });
  
  Object.keys(plugins).forEach(packagename => {
    plugins[packagename].load();
  })

  logger('MAIN').info('插件加载完成');
}

Bot.on('group_message', (msg) => {
  if(msg.raw_message.substr(0, 1) === '.'){
    const cmd = msg.raw_message.substr(1).split(' ');
    const user = msg.sender.user_id;
    const group = msg.group_id;

    if(cmd[0] === 'pm'){
      if(cmd[1] === 'list') {
        const t: Array<string> = [];
        Object.keys(plugins).forEach((e, i) => {
          t.push(`${i}. [${plugins[e].in ? '运行中' : '已停止'}]${plugins[e].package.name} (${plugins[e].package.packagename})`);
        });

        api.OneBot.message.sendGroupMsg(group, t.join('\n'), true);
      }else if(cmd[1] === 'enable'){
        // 启用插件
        if(!admin.isOwner(user) && !admin.isGroupAdmin(user, group) && !admin.isGlobalAdmin(user)) return;

        if(plugins[cmd[2]]){
          plugins[cmd[2]].setGroup(group, true);
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件启用成功');
        }else{
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件未找到');
        }
      }else if(cmd[1] === 'disable'){
        // 禁用插件
        if(!admin.isOwner(user) && !admin.isGroupAdmin(user, group) && !admin.isGlobalAdmin(user)) return;

        if(plugins[cmd[2]]){
          plugins[cmd[2]].setGroup(group, false);
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件禁用成功');
        }else{
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件未找到');
        }
      }else if(cmd[1] === 'load'){
        // 加载插件
        if(!admin.isOwner(user) && !admin.isGlobalAdmin(user)) return;

        if(plugins[cmd[2]]){
          if(plugins[cmd[2]].in){
            api.OneBot.message.sendGroupMsg(group, '[PM] 插件已经加载了');
          }else{
            plugins[cmd[2]].load();
            api.OneBot.message.sendGroupMsg(group, '[PM] 插件加载成功');
          }
        }else{
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件未找到');
        }
      }else if(cmd[1] === 'unload'){
        // 加载插件
        if(!admin.isOwner(user) && !admin.isGlobalAdmin(user)) return;

        if(plugins[cmd[2]]){
          if(!plugins[cmd[2]].in){
            api.OneBot.message.sendGroupMsg(group, '[PM] 插件未加载');
          }else{
            plugins[cmd[2]].unload();
            api.OneBot.message.sendGroupMsg(group, '[PM] 插件卸载成功');
          }
        }else{
          api.OneBot.message.sendGroupMsg(group, '[PM] 插件未找到');
        }
      }
    }else if(cmd[0] === 'admin'){
      if(cmd[1] === 'global'){
        if(!admin.isOwner(user)) return;

        if(cmd[2] === 'add') {
          admin.addGlobalAdmin(Number(cmd[3]));
          api.OneBot.message.sendGroupMsg(group, '[ADMIN] 操作成功');
        }else if(cmd[3] === 'del') {
          admin.delGlobalAdmin(Number(cmd[3]));
          api.OneBot.message.sendGroupMsg(group, '[ADMIN] 操作成功');
        }
      }else if(cmd[1] === 'group'){
        if(!admin.isOwner(user) && !admin.isGlobalAdmin(user)) return;
        
        if(cmd[2] === 'add') {
          admin.addGroupAdmin(Number(cmd[3]), group);
          api.OneBot.message.sendGroupMsg(group, '[ADMIN] 操作成功');
        }else if(cmd[3] === 'del') {
          admin.delGroupAdmin(Number(cmd[3]), group);
          api.OneBot.message.sendGroupMsg(group, '[ADMIN] 操作成功');
        }
      }
    }
  }
})

export default init;