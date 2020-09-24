const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'HELP',
		desc: 'HELP',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		onload: async () => {
			api.logger.info('HELP 开始运行');
		},
		onunload: () => {
			api.logger.info('HELP 停止运行');
		}
	},
	commands: [
		{
			id: 'help',
			helper: '.help(.h) 查看帮助信息',
			command: /^\.help$|^\.h$/,
			func: async (e) => {
				api.bot.socket.send.group([
					'.h	查看帮助信息',
					'.status	查看统计信息',
					'.pm load [file|id]	加载插件',
					'.pm unload [id]	卸载插件',
					'.pm reload [id]	重载插件',
					'.pm info [name]	查看插件信息',
					'.pm cmd [id]	查看插件命令列表',
					'.pm list	查看插件列表',
				].join('\n'), e.group);
			}
		}
	]
}