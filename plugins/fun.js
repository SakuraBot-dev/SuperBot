const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'fun',
		desc: '一些卡片消息和好玩的功能',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info('fun 开始运行')
		},
		// 卸载
		onunload: (e) => {
			api.logger.info('fun 停止始运行')
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
				const msg = t.split(' ')[1];
				api.bot.socket.send.group(`[CQ:json,data=${api.utils.cqCode.encode(`{"app":"com.tencent.autoreply"&#44;"desc":""&#44;"view":"autoreply"&#44;"ver":"0.0.0.1"&#44;"prompt":"&#91;动画表情&#93;"&#44;"meta":{"metadata":{"title":"${title}"&#44;"buttons":&#91;{"slot":1&#44;"action_data":"${msg}"&#44;"name":"戳我戳我！"&#44;"action":"notify"}&#93;&#44;"type":"guest"&#44;"token":"LAcV49xqyE57S17B8ZT6FU7odBveNMYJzux288tBD3c="}}&#44;"config":{"forward":1&#44;"showSender":1}}`)}]`, e.group);
			}
		},
		{
			id: 'tts',
			helper: '.tts [text]	文本转语音',
			command: /^\.tts (.*)$/,
			func: async (e) => {
				await api.bot.http.send.group(`[CQ:tts,text=${api.utils.cqCode.encode(e.msg.substr(5))}]`, e.group)
			}
		},
		{
			id: 'gift',
			helper: '.gift [接收者] [礼物id]	给指定成员送个礼物',
			command: /^\.gift (\d+) (\d)/,
			func: async (e) => {
				const qq = e.msg.substr(6).split(' ')[0];
				const gift = e.msg.substr(6).split(' ')[1];
				await api.bot.http.send.group(`[CQ:gift,qq=${qq},id=${gift}]`, e.group);
			}
		},
		{
			id: 'poke',
			helper: '.poke	让机器人戳你一下',
			command: /^\.poke/,
			func: async (e) => {
				const sender = e.sender.user_id;
				await api.bot.http.send.group(`[CQ:poke,qq=${sender}]`, e.group);
			}
		}
	]
}