const DbClient = require('ali-mysql-client');
const config = require('../config');
const logger = require('./logger').main;

const isCi = (process.argv.indexOf('ci') !== -1);
if(isCi) return;

const db = new DbClient({
	host     : config.db.host,
	user     : config.db.user,
	password : config.db.password,
	database : config.db.database,
	port		 : config.db.port
});

const conf = db.config();

conf.onExecuteError(function({ sql, error }) {
	logger.error(`SQL 执行 ${sql} 时出错，${JSON.stringify(error)}`);
});

module.exports = db;