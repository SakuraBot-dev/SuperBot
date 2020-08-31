const request = require('request');
const api = require('../lib/api');
const config = require('../config');

const p = {
	request: (url) => {
		return new Promise(cb => {
			request(url, {
				headers: {
					Cookie: config.plugin.sec.cookie,
					referer: 'https://x.threatbook.cn/nodev4/vb4/viz',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36'
				}
			}, (err, res, body) => {
				if(res.statusCode === 200 || !err){
					try{
						const info = JSON.parse(body);
						if(info.response_code === 0){
							cb([true, info]);
						}else{
							cb([false, null]);
						}
					}catch (e) {
						cb([false, null]);
					}
				}else{
					cb([false, null]);
				}
			});
		});
	},
	getInfo: async (input) => {
		try{
			const e = await p.request(`https://x.threatbook.cn/graph/data/get/summary?q=${input}`);

			if(e[0]){
				const tags = [];
				Object.keys(e[1].data.intel_tags).forEach(i => {
					tags.push(e[1].data.intel_tags[i].name);
				})

				return [true, {
					token: e[1].token,
					tags: tags,
					data: e[1].data
				}]
			}else{
				return [false, null];
			}
		}catch (e) {
			return [false, null];
		}
	},
	sub_domain: {
		ip: async (ip, token) => {
			try{
				const result = await p.request(`https://x.threatbook.cn/graph/data/second/ip/domains?q=${ip}&token=${token}`);
				if(result[0]){
					const msg = [];
					result[1].data.forEach(e => {
						const tags = [];

						Object.keys(e.intel_tags).forEach(i => {
							tags.push(e.intel_tags[i].name);
						});

						if(tags.length === 0) tags[0] = '暂无标签'

						msg.push(`[${e.date}] ${e.name} (${tags.join(', ')})`);
					});
					return [true, msg.join('\n')];
				}else{
					return [false, null];
				}
			}catch (e) {
				return [false, null];
			}
		},
		domain: async (domain, token) => {
			try{
				const result = await p.request(`https://x.threatbook.cn/graph/data/second/sub/domains?q=${domain}&token=${token}`);
				if(result[0]){
					const msg = [];
					result[1].data.forEach(e => {
						const tags = [];

						Object.keys(e.intel_tags).forEach(i => {
							tags.push(e.intel_tags[i].name);
						})

						if(tags.length === 0) tags[0] = '暂无标签'

						msg.push(`[${e.date}] ${e.name} (${tags.join(', ')})`);
					});
					return [true, msg.join('\n')];
				}else{
					return [false, null];
				}
			}catch (e) {
				return [false, null];
			}
		}
	},
	port: async (ip, token) => {
		// IP Only
		try{
			const result = await p.request(`https://x.threatbook.cn/graph/data/second/ip/ports?q=${ip}&token=${token}`);
			if(result[0]){
				const msg = [];
				result[1].data.forEach((e, index) => {
					msg.push(`===== ${index + 1} =====`)
					msg.push(`更新日期: ${e.time}`);
					msg.push(`端口：${e.name}`);
					msg.push(`协议：${e.module}`);
					msg.push(`详细信息: ${e.detail}`);
					msg.push(`===== ${index + 1} =====`)
				});
				return [true, msg.join('\n')];
			}else{
				return [false, null];
			}
		}catch (e) {
			return [false, null];
		}
	}
}

module.exports = {
	plugin: {
		name: '不知道写啥名字好',
		desc: '不知道写啥名字好',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info(`sec 开始运行`);
		},
		// 卸载
		onunload: (e) => {
			api.logger.info(`sec  停止运行`);
		}
	},
	commands: [
		{
			id: 'ip',
			helper: '.query [IP/域名] 查询IP或域名的信息',
			command: /\.query\ (.*)/,
			func: async (e) => {
				const input = e.msg.substr(7);
				api.bot.send.group('正在查询', e.group);

				const info = await p.getInfo(input);
				if(info[0]){
					let isDomain = true;
					if(!info[1].data.sub_domain_count){
						isDomain = false;
					}

					if(isDomain){
						// 是域名
						const tags = info[1].tags.join(', ');								// 标签
						const token = info[1].token;												// Token
						const sub_domain = info[1].data.sub_domain_count;		// 子域名数量
						const current_ip = info[1].data.current_ip_count;		// 相关IP数量

						api.bot.send.group([
							`域名：${input}`,
							`标签：${tags}`,
							`子域名数量: ${sub_domain}`,
							`相关IP数量：${current_ip}`,
						].join('\n'), e.group);

						const s = await p.sub_domain.domain(input, token);

						if(s[0]){
							api.bot.send.group(s[1], e.group);
						}
					}else{
						// 是IP
						const tags = info[1].tags.join(', ');												// 标签
						const token = info[1].token;																// Token
						const current_domain = info[1].data.current_domain_count;		// 相关域名数量

						api.bot.send.group([
							`IP：${input}`,
							`标签：${tags}`,
							`相关域名数量: ${current_domain}`
						].join('\n'), e.group);

						p.sub_domain.ip(input, token).then(s => {
							if(s[0]){
								api.bot.send.group(s[1], e.group);
							}
						})

						p.port(input, token).then(port => {
							if(port[0]){
								api.bot.send.group(port[1], e.group);
							}
						});
					}
				}else{
					api.bot.send.group('查询失败', e.group);
				}
			}
		}
	]
}