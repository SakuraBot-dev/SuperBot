import config from '../../config'
import Bot from '../bot'
import logger from './logger'

export default new Bot(config.app)

logger('Core').info('初始化成功')
