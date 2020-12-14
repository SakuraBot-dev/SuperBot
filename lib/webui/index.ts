import express from 'express';
import cookieParser from 'cookie-parser';
import md5 from 'md5';
import config from '../../config';
import logger from '../core/logger';

import mod from './module';

export const app: express.Application = express();

app.use(async (req, res, next) => {
  logger('WebUI').info(`${req.ip} ${req.method} ${decodeURI(req.url)}`);
  next();
});

app.use(cookieParser())
app.use(express.static('./static'));

app.use((req, res, next) => {
  if(req.url.substr(0, 12) === '/api/v1/auth') return next();

  if(req.cookies && md5(config.webui.password) === req.cookies['password']) return next();

  res.status(401).json({
    code: 401,
    message: '请先登录'
  });
})

// 登录
app.get('/api/v1/auth', (req, res) => {
  const password = req.query.password;
  if(password === config.webui.password) {
    res.cookie('password', md5(password));
    res.json({
      code: 200,
      msg: '登录成功'
    });
  } else {
    res.status(403).json({
      code: 403,
      msg: '密码错误'
    });
  }
});

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

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    msg: '404 Not Found'
  })
})