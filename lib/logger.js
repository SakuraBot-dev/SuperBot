const log4js = require('log4js');
const config = require('../config');

const isCi = process.argv.indexOf('ci') !== -1;

const log = {
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
};

if(isCi){
  log.appenders.file.filename = 'logs/ci';
  log.categories.default.appenders = ['file'];
  delete log.appenders.console;
}

log4js.configure(log);

const main = log4js.getLogger('MAIN');
const plugin = log4js.getLogger('Plugin');

module.exports.main = main;
module.exports.plugin = plugin;