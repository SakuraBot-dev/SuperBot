const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'debug',
		desc: 'debug',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info('debug 开始运行')
		},
		// 卸载
		onunload: (e) => {
			api.logger.info('debug 停止始运行')
		}
	},
	commands: [
		{
			id: 'replyCard',
			helper: '.reply_card [title] [msg] Reply Card',
			command: /^\.reply_card (.*)$/,
			func: async (e) => {
				const t = e.msg.substr(12);
				const title = t.split(' ')[0];
				const msg = t.split(' ')[0];
				api.bot.socket.send.group(`[CQ:json,data=${api.utils.cqCode.encode(`{"app":"com.tencent.autoreply"&#44;"desc":""&#44;"view":"autoreply"&#44;"ver":"0.0.0.1"&#44;"prompt":"&#91;动画表情&#93;"&#44;"meta":{"metadata":{"title":"${title}"&#44;"buttons":&#91;{"slot":1&#44;"action_data":"${msg}"&#44;"name":"戳我戳我！"&#44;"action":"notify"}&#93;&#44;"type":"guest"&#44;"token":"LAcV49xqyE57S17B8ZT6FU7odBveNMYJzux288tBD3c="}}&#44;"config":{"forward":1&#44;"showSender":1}}`)}]`, e.group);
			}
		}
	]
}