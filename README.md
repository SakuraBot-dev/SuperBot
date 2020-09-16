# SuperBot
一个普通的QQ机器人


## 如何使用
1. 参考注释修改配置文件，记得重命名成 `config.js`
2. 保留需要的插件 打开cmd,输入cd 文件路径 跳转到插件那里，然后输入npm i node app 启动插件
3. 看到日志没报错就是成功了

## 开发插件
参考下面的代码进行开发就行<br>
写好之后扔 plugins 目录，群聊发送 `pm load xxx.js` 加载插件
```javascript
const api = require('../lib/api');

module.exports = {
  plugin: {
    name: '', // 插件名字
    desc: '', // 插件介绍
    version: '',  // 版本号
    author: ''    // 作者
  },
  events: {
    // 事件列表
    onload: (e) => {
      // 插件被加载
	},
    onunload: (e) => {
      // 插件被卸载
    }
  },
  commands: [
    // 命令列表
    {
      id: '',   // 命令标识，不能重复，不能包含下划线
      helper: '',   // 帮助信息
      command: /\//,    // 正则表达式，匹配命令
      func: async (e) => {
        // 触发命令执行的函数
      }
    }
  ]
}
```