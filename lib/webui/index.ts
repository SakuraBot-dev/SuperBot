import express from 'express';
import config from '../../config';
import logger from '../core/logger';

import mod from './module';

export const app: express.Application = express();

app.use(async (req, res, next) => {
  logger('WebUI').info(`${req.ip} ${req.method} ${decodeURI(req.url)}`);
  next();
});

app.use((req, res, next) => {
  if(req.query.access_token === config.webui.access_token) return next();
  res.status(403).send({
    code: 403,
    msg: 'Denied',
    result: null
  })
})

// 日志列表
app.get('/api/v1/log/list', (req, res) => {
  const list = mod.logger.getLogList();
  res.json({
    code: 200,
    msg: 'success',
    result: list
  })
})

// 读取日志
app.get('/api/v1/log/read', (req, res) => {
  const log = mod.logger.readLog(String(req.query.file));
  res.json({
    code: 200,
    msg: 'success',
    result: log
  })
})

// 插件列表
app.get('/api/v1/plugin/list', (req, res) => {
  const list = mod.plugin.pluginList();
  res.json({
    code: 200,
    msg: 'success',
    result: list
  })
})

// 加载插件
app.get('/api/v1/plugin/load', (req, res) => {
  const r = mod.plugin.loadPlugin(String(req.query.plugin));
  res.json({
    code: 200,
    msg: 'success',
    result: r
  })
})

// 卸载插件
app.get('/api/v1/plugin/unload', async (req, res) => {
  const r = await mod.plugin.unloadPlugin(String(req.query.plugin));
  res.json({
    code: 200,
    msg: 'success',
    result: r
  })
})

// 机器人状态
app.get('/api/v1/bot/stats', async (req, res) => {
  res.json({
    code: 200,
    msg: 'success',
    result: mod.stats.stats
  })
})