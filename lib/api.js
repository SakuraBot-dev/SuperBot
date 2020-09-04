const bot = require('./bot');
const logger = require('./logger').plugin;
const config = require('../config').plugin;

module.exports.bot = bot;
module.exports.logger = logger;
module.exports.config = config;