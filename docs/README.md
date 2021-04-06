# 文档
## 目录
- [文档](#文档)
  - [目录](#目录)
  - [使用方法](#使用方法)
    - [构建和配置](#构建和配置)
    - [配置文件](#配置文件)
  - [插件开发](#插件开发)
    - [0x01 配置文件](#0x01-配置文件)
    - [0x02 入口文件](#0x02-入口文件)
    - [0x03 API](#0x03-api)
  - [注意事项](#注意事项)

## 使用方法
### 构建和配置
- 首先运行 `npm install` 或者 `yarn` 安装依赖
- 然后运行 `npm run build` 即可构建用于生产环境的代码
- 最后运行 `npm start`，第一次启动会自动生成配置文件，文件名为 `config.json`，按照提示手动修改后再次启动即可
- 具体的配置文件可以看下面

### 配置文件
```json
{
    "version": "3.0.0",         // 配置文件对应的版本号
    "master": {
        "OneBot": 0,            // 主人uid
        "telegram": 0           // 主人uid
    },
    "app": {
        "OneBot": {
            "enable": false,   // 是否启用OneBot
            "host": "",        // IP/域名
            "port": 6700,      // 端口
            "accessToken": ""  // access_token
        },
        "telegram": {
            "enable": true,    // 是否启用Telegram
            "token": ""        // 机器人的Token
        }
    },
    "logger": {
        "level": "INFO"        // 日志级别
    }
}
```

## 插件开发
### 0x01 配置文件
- 首先你需要新建一个 `superbot.config.json` 文件
- 格式参考下面
```json
{
  "name": "插件名字",
  "entry": "入口文件",
  "packagename": "插件包名"
}
```
### 0x02 入口文件
- 然后新建一个文件作为入口文件，注意要与 `superbot.config.json` 中保持一致
- 写法大致如下
```typescript
import { ctx } from '../../res/core/ctx'

export default (ctx: ctx) => {
  ctx.command(/\/hello/, '/hello', 'Hello,World!', (m, source, message, reply) => {
    if (source === 'OneBot') reply(ctx.OneBot.getBuilder().at(message.sender.user_id).text('world!'))
    if (source === 'telegram') reply('world!')
  })
}
```
- 注：这里 import ctx 只是为了更好的代码提示

### 0x03 API
- 大部分 API 都与上游框架保持一致，部分接口做了少量修改
- OneBot 的 API 可以参考 [这个](https://github.com/howmanybots/onebot/blob/master/v11/specs/api/public.md)，需要注意的是少部分不常用的 API 并没有在 SuperBot 中实现
- OneBot API 的返回值和参数均与文档中一致，事件也与文档一致，
- Telegram 的 API 可以参考 [这个](https://telegraf.js.org/)
- 需要注意的是 Telegram 由于上游依赖的问题并不能正常使用 `bot.on('xxx')`，需要改为 `bot.event.on('xxx')`

## 注意事项
- 不要直接使用telegram的on，由于上游依赖库问题导致它同一个事件只能绑定一次