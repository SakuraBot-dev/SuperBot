import fs from 'fs'
import pack from './package.json'

const configPath = './config.json'

const defaultConfig = {
  version: pack.version,
  app: {
    OneBot: {
      enable: false,
      host: '',
      port: '',
      accessToken: ''
    },
    telegram: {
      enable: false,
      token: ''
    }
  },
  logger: {
    level: 'INFO'
  }
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, undefined, 4))
  console.log('默认配置创建完成，请修改 config.json 后重新启动程序')
  process.exit(0)
} else {
  const conf = JSON.parse(fs.readFileSync('./config.json').toString())
  if (!conf.version || conf.version !== pack.version) {
    const newConf = Object.assign(defaultConfig, conf)
    newConf.version = pack.version
    fs.writeFileSync(configPath, JSON.stringify(newConf, undefined, 4))
    console.log('配置文件版本不匹配，已更新完成，请参考 README.md 手动修改后重新启动程序')
    process.exit(0)
  }
}

export default JSON.parse(fs.readFileSync('./config.json').toString())
