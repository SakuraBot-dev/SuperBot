const rss = require('rss-parser');
const api = require('../lib/api')
const db = require('../lib/db');

const n = {};
const parser = new rss()

const update = async () => {
	api.logger.info(`RSS 开始更新订阅`);
	const r = await db.select('*').from('feed').where('status', 'enable').queryList();
	const tmp = [];
	for (const _rss of r) {
		if(tmp.indexOf(_rss.url) === -1){
			tmp.push(_rss.url);
			parser.parseURL(_rss.url).then(async rss_result => {
				const id = rss_result.items[0].link;
				if(id !== _rss.last_id) {
					const groups = await db.select('*').from('feed').where('url', _rss.url).queryList();
					groups.forEach(e => {
						api.bot.send.group([
							`[RSS] 您订阅的 ${rss_result.title} 更新了`,
							`标题：${rss_result.items[0].title}`,
							`链接：${rss_result.items[0].link}`
						].join('\n'), e.group);
					});
					db.update('feed').where('url', _rss.url).column('last_id', id).execute();
				}
			}).catch(e => {
				api.logger.warn(`RSS 更新失败, url: ${_rss.url}, err: ${JSON.stringify(e)}`);
			})
		}
	}

	api.logger.info(`RSS 订阅更新完成，跳过了 ${r.length - tmp.length} 个订阅`);
}

module.exports = {
	plugin: {
		name: 'RSS订阅器',
		desc: '不会用别用，不要订阅乱七八糟的东西',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			n.timer = setInterval(async () => {
				await update();
			}, 3e5);
			api.logger.info(`RSS RSS订阅器开始运行`);
		},
		// 卸载
		onunload: (e) => {
			clearInterval(n.timer);
			api.logger.info(`RSS RSS订阅器停止运行`);
		}
	},
	commands: [
		{
			id: 'add',
			helper: '.rss add [链接]	添加订阅',
			command: /\.rss add (.*)/,
			func: async (e) => {
				const link = e.msg.substr(9);
				const group = e.group;
				const sender = e.sender.user_id;

				if(/^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/g.test(link)){
					parser.parseURL(link).then(e => {
						db
						.insert('feed')
						.column('url', link)
						.column('group', group)
						.column('user', sender)
						.column('status', 'enable')
						.execute();
						api.bot.send.group('[RSS] 订阅成功', group);
					}).catch(e => {
						api.bot.send.group('[RSS] 订阅失败', group);
					});
				}else{
					api.bot.send.group('[RSS] 请填写正确的链接', group);
				}
			}
		},
		{
			id: 'remove',
			helper: '.rss remove [id]	删除订阅',
			command: /\.rss remove (.*)/,
			func: async (e) => {
				const id = e.msg.substr(12);
				const group = e.group;

				try{
					db
					.delete('feed')
					.where('id', id)
					.where('group', group)
					.execute();
					api.bot.send.group('[RSS] 删除成功', group);
				}catch (e) {
					api.bot.send.group('[RSS] 删除失败', group);
				}
			}
		},
		{
			id: 'list',
			helper: '.rss list	查看本群订阅列表',
			command: /\.rss list/,
			func: async (e) => {
				try{
					const r = await db
					.select('*')
					.from('feed')
					.where('group', e.group)
					.queryList();

					const m = [];
					r.forEach(e => {
						m.push(`${Number(e.id)}. ${e.url}`);
					});

					if(r.length === 0){
						api.bot.send.group('[RSS] 这个群还没有订阅任何内容', e.group);
					}else{
						api.bot.send.group(m.join('\n'), e.group);
					}
				}catch (e) {
					api.bot.send.group('[RSS] 查询失败', e.group);
				}
			}
		},
		{
			id: 'update',
			helper: '.rss update	立刻刷新订阅',
			command: /\.rss update/,
			func: async (e) => {
				await update();
				api.bot.send.group('[RSS] 刷新成功', e.group);
			}
		}
	]
}