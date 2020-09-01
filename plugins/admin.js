const api = require('../lib/api');
const admin = require('../lib/admin');

module.exports = {
	plugin: {
		name: 'AdminManager',
		desc: '管理员管理器',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info(`AdminManager 开始运行`);
		},
		// 卸载
		onunload: (e) => {
			api.logger.info(`AdminManager 停止运行`);
		}
	},
	commands: [
		{
			id: 'add',
			helper: '.m add [QQ号] 添加管理员',
			command: /\.m add (.*)/,
			func: async (e) => {
				const qq = e.msg.substr(7);
				const sender = e.sender.user_id;

				if(admin.isOwner(sender)){
					if(admin.addAdmin(qq)){
						api.bot.send.group('[AdminManager] 添加成功', e.group);
					}else{
						api.bot.send.group('[AdminManager] 添加失败', e.group);
					}
				}else{
					api.bot.send.group('[AdminManager] 你想干啥？', e.group);
				}
			}
		},
		{
			id: 'rm',
			helper: '.m rm [QQ号] 删除管理员',
			command: /\.m rm (.*)/,
			func: async (e) => {
				const qq = e.msg.substr(7);
				const sender = e.sender.user_id;

				if(admin.isOwner(sender)){
					if(admin.removeAdmin(qq)){
						api.bot.send.group('[AdminManager] 删除成功', e.group);
					}else{
						api.bot.send.group('[AdminManager] 删除失败', e.group);
					}
				}else{
					api.bot.send.group('[AdminManager] 你想干啥？', e.group);
				}
			}
		},
		{
			id: 'ls',
			helper: '.m ls 查看管理员列表',
			command: /\.m ls/,
			func: async (e) => {
				api.bot.send.group([
					'=====AdminManager=====',
					admin.list.join('\n'),
					'=====AdminManager====='
				].join('\n'), e.group);
			}
		}
	]
}