const fs = require('fs');
const bot = require('./lib/bot');
const admin = require('./lib/admin');
const test = require('./lib/test');
const gcStat = require('./lib/gc');
const logger = require('./lib/logger').main;
const EventEmitter = require('events').EventEmitter;
const cmd_event = new EventEmitter();

// 命令列表
let cmd_event_list = [];

// 插件列表
const plugins = [];

const isCi = process.argv.indexOf('ci') !== -1;

const utils = {
  getUptime: () => {
    const uptime = process.uptime();
    const days = `${~~(uptime/(3600*24))}`;
    const t = new Date(uptime*1e3);

    return `${days} days, ${t.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false })}`;
  },
  humanMem: (bytes) => {
    if(bytes > Number.MAX_SAFE_INTEGER) {
      return "This file's size (as bytes) has exceeded the MAX_SAFE_INTEGER limitation of float64.";
    }
    const units = ["B", "KB", "MB", "GB", "TB"];
    let result = "";
    for(let i = units.length - 1; i >= 0; i--) {
      if(bytes >= 1024 ** i) {
        result += ~~(bytes / 1024 ** i);
        result += `${units[i]} `;
        bytes %= 1024 ** i;
      }
    }
    return result.trim();
  }
}


bot.event.on('group_msg', (e) => {
  cmd_event_list.forEach(c => {
    if(c.command.test(e.msg)){
      const id = c.key.split('_')[0];
      const cmd = c.key.split('_')[1];
      logger.info(`${e.sender.user_id} 触发了 ${plugins[id].name} 的 ${cmd} 命令`);
      cmd_event.emit(c.key, e);
    }
  })

  if(e.msg.substr(0,1) === '.'){
    const cmd = e.msg.substr(1).split(' ');
    if(cmd[0] === 'status'){
      bot.socket.send.group([
        `uptime: ${utils.getUptime()}`,
        `plugins: ${plugins.length}`,
        `commit: ${require('child_process').execSync('git rev-parse HEAD').toString().trim().substr(0, 7)}`,
        `node version: ${process.versions.node}`,
        `v8 version: ${process.versions.v8}`,
        `heap: ${utils.humanMem(process.memoryUsage().heapUsed)}/${utils.humanMem(process.memoryUsage().heapTotal)}`,
        `allocated memory: ${utils.humanMem(process.memoryUsage().rss)}`,
        `external: ${utils.humanMem(process.memoryUsage().external)}`,
        `GitHub: https://git.io/JUYDe`,
        `NumGC: ${gcStat.gcInfo.num}`,
        `ForceGC: ${gcStat.gcInfo.force}`
      ].join('\n'), e.group);
    }else if(cmd[0] === 'gc'){
      if(gcStat.gc()){
        bot.socket.send.group('succeed', e.group);
      }else{
        bot.socket.send.group('failed: 请尝试添加\'--expose_gc\'参数', e.group);
      }
    }else if(cmd[0] === 'pm'){
      if(cmd[1] === 'unload'){
        // 卸载插件
        if(!admin.isAdmin(e.sender.user_id)) return;
        const id = cmd[2];
        if(plugins[id]){
          if(plugins[id].status === 'running'){
            pluginMgr.unload(Number(id));
            bot.socket.send.group('[PM] 卸载成功', e.group);
          }else{
            bot.socket.send.group('[PM] 插件没有被加载', e.group);
          }
        }else{
          bot.socket.send.group('[PM] 插件未找到', e.group);
        }
      }else if(cmd[1] === 'load'){
        // 加载插件
        if(!admin.isAdmin(e.sender.user_id)) return;
        const id = cmd[2];
        if(plugins[id]){
          if(plugins[id].status === 'unloaded'){
            pluginMgr.load(Number(id));
            bot.socket.send.group('[PM] 加载成功', e.group);
          }else{
            bot.socket.send.group('[PM] 插件已经被加载了', e.group);
          }
        }else{
          pluginMgr.load(id);
        }
      }else if(cmd[1] === 'reload'){
        // 重载插件
        if(!admin.isAdmin(e.sender.user_id)) return;
        const id = cmd[2];
        if(plugins[id]){
          if(plugins[id].status === 'unloaded'){
            pluginMgr.load(Number(id));
            bot.socket.send.group('[PM] 加载成功', e.group);
          }else{
            pluginMgr.unload(Number(id));
            pluginMgr.load(Number(id));
            bot.socket.send.group('[PM] 重载成功', e.group);
          }
        }
      }else if(cmd[1] === 'info'){
        // 插件信息
        const id = cmd[2];
        let p = null;
        if(typeof id === 'string'){
          // 插件名
          let plugin_id = -1;
          plugins.forEach((e, i) => {
            if(e.name === id){
              plugin_id = i;
            }
          });

          if(plugin_id === -1){
            bot.socket.send.group('[PM] 插件未找到', e.group);
          }else{
            p = plugins[plugin_id];
          }
        }else{
          // 插件id
          if(plugins[id]){
            p = plugins[id];
          }else{
            bot.socket.send.group('[PM] 插件未找到', e.group);
          }
        }

        if(p){
          bot.socket.send.group([
            `========PM========`,
            `名称：${p.name}`,
            `介绍：${p.desc}`,
            `版本：${p.version}`,
            `作者：${p.author}`,
            `状态：${p.status === 'running' ? '运行中' : '已停止'}`,
            `========PM========`
          ].join('\n'), e.group);
        }
      }else if(cmd[1] === 'list'){
        // 插件列表
        const i = [];
        plugins.forEach((e) => {
          i.push(`${e.id}. [${e.status === 'running' ? '运行中' : '已停止'}]${e.name}(${e.file})`);
        });
        bot.socket.send.group(i.join('\n'), e.group);
      }else if(cmd[1] === 'cmd'){
        // 插件命令列表
        const id = cmd[2];
        if(plugins[id]){
          const r = [];

          r.push(`======== ${plugins[id].name} ========`);

          Object.keys(plugins[id].in.commands).forEach(e => {
            r.push(plugins[id].in.commands[e].helper);
          });

          r.push(`======== ${plugins[id].name} ========`);

          if(r.length === 0){
            bot.socket.send.group('[PM] 这个插件没有注册任何命令', e.group);
          }else{
            bot.socket.send.group(r.join('\n'), e.group);
          }
        }else{
          bot.socket.send.group('[PM] 插件未找到', e.group);
        }
      }
    }
  }
})

const command_mgr = {
  /**
   * @name 注册命令
   * @param {String} key 命令标识
   * @param {Function} command 命令对应的函数
   */
  add: (key, command) => {
    let hasReg = false;
    cmd_event_list.forEach((e, i) => {
      if(e.key === key){
        if(e.command === command){
          hasReg = true;
        }else{
          cmd_event_list[i] = null;
        }
      }
    });

    if(!hasReg) {
      cmd_event_list.push({
        key: key,
        command: command
      });
    }

    const t = [];
    cmd_event_list.forEach(e => {
      if(e) t.push(e);
    });
    cmd_event_list = t;
  },
  /**
   * @name 删除命令
   * @param {String} key 命令标识
   */
  remove: (key) => {
    const t = [];
    cmd_event_list.forEach(e => {
      if(e){
        if(e.key !== key){
          t.push(e);
        }
      }
    });
    cmd_event_list = t;
  },
  /**
   * @name 清空已注册的命令
   * @param id
   */
  removeAll: (id) => {
    const t = [];
    cmd_event_list.forEach(e => {
      if(e){
        if(e.key.split('_')[0] !== id){
          t.push(e);
        }
      }
    });
    cmd_event_list = t;
  }
}

// 插件管理
const pluginMgr = {
  /**
   * @name 加载插件
   * @param {String|Number} file 文件名
   */
  load: (file) => {
    if(typeof file === 'number'){
      // 动态加载
      const id = file;

      logger.info(`正在加载 ${plugins[id].file}`);

      const p = require(`./plugins/${plugins[id].file}`);

      plugins[id] = {
        in: p,
        name: p.plugin.name,
        desc: p.plugin.desc,
        version: p.plugin.version,
        author: p.plugin.author,
        id: id,
        status: 'running',
        file: plugins[id].file,
      };

      pluginMgr.bind(id, plugins[id].in.events);
      pluginMgr.bind_commands(id, plugins[id].in.commands);

      plugins[id].in.events.onload({
        id: id,
        status: 'running'
      });
      logger.info(`${plugins[id].file} 加载完成`);
    }else{
      logger.info(`正在加载 ${file}`);
      // 第一次被加载
      const id = plugins.length;
      const p = require(`./plugins/${file}`);

      plugins[id] = {
        in: p,
        name: p.plugin.name,
        desc: p.plugin.desc,
        version: p.plugin.version,
        author: p.plugin.author,
        id: id,
        status: 'running',
        file: file,
      };

      if(isCi) test.run(plugins[id]);

      pluginMgr.bind(id, plugins[id].in.events);
      pluginMgr.bind_commands(id, plugins[id].in.commands);

      plugins[id].in.events.onload({
        id: id,
        status: 'running'
      });
      
      logger.info(`${file} 加载完成`);
    }
  },
  /**
   * @name 卸载插件
   * @param {Number} id
   */
  unload: (id) => {
    logger.info(`正在卸载 ${plugins[id].file}`);
    plugins[id].status = 'unloaded';
    pluginMgr.unbind(id, plugins[id].in.events);
    pluginMgr.unbind_commands(id, plugins[id].in.commands);
    plugins[id].in.events.onunload({
      id: id,
      status: 'unloaded'
    });
    
    // 删除require的缓存
    delete require.cache[require.resolve(`./plugins/${plugins[id].file}`)]
    
    logger.info(`${plugins[id].file} 卸载完成`);
  },
  /**
   * @name 挂载事件监听器
   * @param {Number} id 插件id
   * @param {[{String: Function}]} events 插件的事件对象
   */
  bind: (id, events) => {
    Object.keys(events).forEach(name => {
      logger.debug(`为 ${plugins[id].name} 绑定了 ${name} 事件`);
      const func = events[name];
      bot.event.addListener(name, func);
    });
  },
  /**
   * @name 卸载事件监听器
   * @param {Number} id 插件id
   * @param {[{String: Function}]} events 插件的事件对象
   */
  unbind: (id, events) => {
    Object.keys(events).forEach(name => {
      logger.debug(`为 ${plugins[id].name} 卸载了 ${name} 事件`);
      const func = events[name];
      bot.event.removeListener(name, func);
    });
  },
  /**
   * @name 挂载命令监听器
   * @param {Number} id 插件id
   * @param {[{id: String, func: Function}]} commands 命令列表
   */
  bind_commands: (id, commands) => {
    Object.keys(commands).forEach(n => {
      const e = commands[n];
      logger.debug(`为 ${plugins[id].name} 绑定了 ${e.id} 命令`);
      cmd_event.removeListener(`${id}_${e.id}`, e.func);
      cmd_event.addListener(`${id}_${e.id}`, e.func);
      command_mgr.add(`${id}_${e.id}`, e.command);
    });
  },
  /**
   * @name 卸载命令监听器
   * @param {Number} id 插件id
   * @param {[{id: String, func: Function}]} commands 命令列表
   */
  unbind_commands: (id, commands) => {
    Object.keys(commands).forEach(n => {
      const e = commands[n];
      logger.debug(`为 ${plugins[id].name} 卸载了 ${e.id} 命令`);
      cmd_event.removeListener(`${id}_${e.id}`, e.func);
      command_mgr.remove(`${id}_${e.id}`);
    });
  }
}

module.exports = () => {
  logger.info(`开始加载插件`);
  const file = fs.readdirSync(`./plugins`);
  
  file.forEach(e => {
    pluginMgr.load(e);
  });
}