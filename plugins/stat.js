const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'stat',
		desc: '消息统计',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info('stat 开始运行')
		},
		// 卸载
		onunload: (e) => {
			api.logger.info('stat 停止始运行')
		}
	},
	commands: [
		{
			id: 'stat',
			helper: '.stat 查看发送/接收消息数量',
			command: /^\.stat$/,
			func: async (e) => {
				api.bot.send.group([
					`接收消息: ${api.bot.stat.receive || 'unknown'} 条`,
					`发送消息: ${api.bot.stat.send || 'unknown'} 条`,
					`raw消息: ${api.bot.send.raw || 'unknown'} 条`
				].join('\n'), e.group);
			}
		}
	]
}