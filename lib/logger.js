const log4js = require('log4js');
const config = require('../config');

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: 'logs/default',
      alwaysIncludePattern: true,
      pattern: 'yyyy-MM-dd.log'
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['file', 'console'],
      level: config.logger.level
    }
  }
});

const main = log4js.getLogger('MAIN');
const plugin = log4js.getLogger('Plugin');

module.exports.main = main;
module.exports.plugin = plugin;