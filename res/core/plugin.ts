import { join } from 'path'
import fs from 'fs'
import logger from './logger'
import ctx, { commands } from './ctx'

const getPluginCtx = (packagename: string, data: string) => {
  const pluginCtx = { ...ctx }
  // @ts-ignore
  pluginCtx.logger = logger(packagename)
  // @ts-ignore
  pluginCtx.path = data
  return pluginCtx
}

export default async () => {
  try {
    fs.mkdirSync(join(__dirname, '../../data'))
  } catch (error) { }

  logger('Plugin').info('开始加载插件')
  const root = join(__dirname, '../../plugins')
  const files = fs.readdirSync(root)

  const plugins: any[] = []

  for (const file of files) {
    try {
      logger('Plugin').info('正在载入 ', file)

      const path = join(root, file)
      const config = JSON.parse(fs.readFileSync(join(path, './superbot.config.json')).toString())

      if (config.disable) return

      const id = plugins.length

      plugins[id] = {
        root: path,
        name: config.name,
        packagename: config.packagename,
        data: join(__dirname, '../../data/', config.packagename),
        entry: config.entry
      }

      plugins[id].instance = await import(join(path, plugins[id].entry))
      plugins[id].instance.default(getPluginCtx(plugins[id].packagename, plugins[id].data))

      try {
        fs.mkdirSync(plugins[id].data)
      } catch (error) { }

      logger('Plugin').info(file, '载入完成')
    } catch (error) {
      logger('Plugin').error(file, '加载失败', error)
    }
  }

  logger('Plugin').info('插件加载完成')

  ctx.command(/^\/pm list$/gm, '/pm list', '查看插件列表', (m, source, message, reply) => {
    const msg: string[] = []
    plugins.forEach((e, i) => {
      msg.push(`${i}. ${e.name}`)
    })
    reply(msg.join('\n'))
  })

  ctx.command(/^\/help$/gm, '/help', '查看帮助信息', (m, source, message, reply) => {
    let maxLen = 0
    const cmds: string[] = []
    commands.forEach(e => {
      if (e.cmd.length > maxLen) maxLen = e.cmd.length
    })

    commands.forEach(e => {
      cmds.push(`${e.cmd.padEnd(maxLen + 5)}${e.helper}`)
    })

    const msg = cmds.join('\n').replace('_', '\\_').replace('!', '\\!').replace('*', '\\*').replace('[', '\\[').replace('`', '\\`')

    if (source === 'telegram') {
      reply(`\`${msg}\``, {
        parse_mode: 'MarkdownV2'
      })
    } else {
      reply(cmds.join('\n'))
    }
  })
}
