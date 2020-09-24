const dns = require('dns');
const api = require('../lib/api');

const resolver = new dns.Resolver();
resolver.setServers(['223.5.5.5', '223.6.6.6']);

module.exports = {
	plugin: {
		name: 'DNS',
		desc: 'DNS',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: () => {
			api.logger.info('DNS 开始运行')
		},
		// 卸载
		onunload: () => {
			resolver.cancel();
			api.logger.info('DNS 停止始运行')
		}
	},
	commands: [
		{
			id: 'nslookup',
			helper: '.nslookup [域名] [类型] 查询域名的DNS记录',
			command: /^\.nslookup (.*) (.*)$/,
			func: async (e) => {
				const input = e.msg.substr(10);
				const domain = input.split(' ')[0];
				const type = input.split(' ')[1].toUpperCase();

				try{
					resolver.resolve(domain, type, (err, address) => {
						if(err){
							api.logger.error(err);
							api.bot.socket.send.group('查询失败', e.group);
						}else{
							api.bot.socket.send.group([
								`域名：${domain}`,
								`类型：${type}`,
								`结果：${address.join(', ')}`
							].join('\n'), e.group);
						}
					});
				}catch (e) {
					api.logger.error(e);
					api.bot.socket.send.group('查询失败', e.group);
				}
			}
		}
	]
}