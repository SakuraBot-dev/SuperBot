const log4js = require('log4js');

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: '../logs',
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log',
      compress: true
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['file', 'console'],
      level: 'debug'
    }
  }
});

const main = log4js.getLogger('MAIN');
const plugin = log4js.getLogger('Plugin');

module.exports.main = main;
module.exports.plugin = plugin;