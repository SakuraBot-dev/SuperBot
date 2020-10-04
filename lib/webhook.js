const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');
const config = require('../config');
const logger = require('./logger').webhook;
const app = express();

const routes = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  const t = new Date().getTime();
  await next();
  logger.info(`${req.method} ${new Date().getTime() - t} "${req.originalUrl}" ${req.hostname} "${req.ip}"`);
});

app.use((req, res, next) => {
  Object.keys(routes).forEach(async index => {
    const e = routes[index];
    if (e.enable) {
      if(req.method.toLowerCase() === e.method.toLowerCase() && new RegExp(e.path).test(req.originalUrl)) {
        try{
          const result = await e.func(req);
          res.send(result);
        }catch(e){
          // 执行出错的route
          logger.warn(e);
          res.status(503).send(util.inspect(e));
        }
      }else{
        // 未找到route
        next();
      }
    }else{
      // 未启用的route
      res.status(503).send('service not running');
    }
  })
});

app.use((req, res) => {
  // 404请求
  res.status(404).send('404 not found');
})

module.exports.addRouter = (id, path, method, func) => {
  if (routes[id]) {
    if (!routes[id].enable) {
      routes[id].enable = true;
    }
  } else {
    routes[id] = { path, method, func, enable: true };
  }
}

module.exports.removeRoute = (id) => {
  if(routes[id]) {
    routes[id].enable = false;
  }
}

app.listen(config.webhook.port, config.webhook.host);