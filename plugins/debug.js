const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'DEBUG',
		desc: 'DEBUG',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: () => {
			api.logger.info('DEBUG 开始运行')
		},
		// 卸载
		onunload: () => {
			api.logger.info('DEBUG 停止始运行')
		}
	},
	commands: [
		{
			id: 'debug1',
			helper: '.debug',
			command: /^\.debug$/,
			func: async (e) => {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
        <msg  serviceID="1" brief="新消息" templateID="" action="新消息" sourceMsgId="0" url="" flag="1" adverSign="0" multiMsgFlag="0">
            <item layout="0">
                <title color="#007ACC" size="32">title</title>
            </item>
            <item layout="0">
                <title color="#1E1E1E" size="32">item 1</title>
            </item>
            <source name="SuperBot" url="" action="plugin" appid="-1"/>
        </msg>`;
        api.bot.socket.send.group([{
          type: 'xml',
          data: {
            data: xml
          }
        }], e.group);
			}
		}
	]
}