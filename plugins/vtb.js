const api = require('../lib/api');
const io = require('socket.io-client');

let socket = null;

const cache = {
	hawk: {
		day: [],
		h: []
	},
	vtb: [],
}

let timer = null;

const utils = {
	sendHawk: () => {
		api.logger.info('开始推送弹幕信息');

		const day = cache.hawk.day.map((e, i) => {
			return `${i + 1}. ${e.word}`;
		}).join('\n');

		const h = cache.hawk.h.map((e, i) => {
			return `${i + 1}. ${e.word}`;
		}).join('\n');

		api.config.vtb.groups.forEach(group => {
			api.bot.send.group([
				`最近一小时直播弹幕TOP10：`,
				h,
				`===============`,
				`最近24小时直播弹幕TOP10：`,
				day
			].join('\n'), group)
		})

		api.logger.info(`向 ${api.config.vtb.groups.length} 个群推送弹幕信息`);
	},
	sendLiveStat: (mid, name, title, online, link) => {
		api.logger.info(`正在推送 ${cache.vtb[mid].name}(${mid}) 的开播信息`);

		api.config.vtb.groups.forEach(group => {
			api.bot.send.group([
				`${name} 开播了`,
				title,
				link,
				`立即与 ${online} 位小伙伴一起打call~`
			].join('\n'), group)
		});

		const r = api.data.get('vtb', `feed_${mid}`);

		if(r){
			r.split(',').forEach(group => {
				api.bot.send.group([
					`${name} 开播了`,
					title,
					link,
					`立即与 ${online} 位小伙伴一起打call~`
				].join('\n'), group)
			});
		}

		api.logger.info(`向 ${api.config.vtb.groups.length} 个群推送开播信息`);
	},
	init: () => {
		socket = io.connect(api.config.vtb.host, {
			reconnection: true,
			autoConnect: false,
			transports: ['websocket', 'polling']
		});

		socket.open();

		socket.on('ping', (data) => {
			api.logger.debug(`vtb ping: ${data}`);
		});

		timer = setInterval(() => {
			utils.sendHawk();
		}, 3e5);

		socket.on('connect', () => {
			api.logger.info('vtb Socket连接成功')
		});

		socket.on('disconnect', (reason) => {
			api.logger.warn(`vtb Socket断开连接: ${reason}`);
		});

		socket.on('error', (error) => {
			api.logger.error(`vtb Socket错误: ${JSON.stringify(error)}`);
		});

		socket.on('hawk', (data) => {
			// 弹幕统计数据

			cache.hawk.day = data.day.slice(0, 10);
			cache.hawk.h = data.h.slice(0, 10);
		});

		socket.on('info', (data) => {
			// 直播统计数据
			data.forEach(e => {
				if(!cache.vtb[e.mid]){
					cache.vtb[e.mid] = {
						link: `https://live.bilibili.com/${e.roomid}`,
						name: e.uname,
						title: e.title,
						stat: (e.liveStatus === 1),
						online: e.lastLive.online
					}
				}else{
					cache.vtb[e.mid].link = `https://live.bilibili.com/${e.roomid}`;
					cache.vtb[e.mid].name = e.uname;
					cache.vtb[e.mid].title = e.title;
					cache.vtb[e.mid].online = e.lastLive.online;

					if(!cache.vtb[e.mid].stat && e.liveStatus === 1){
						// 新开播
						api.logger.debug(JSON.stringify(e));
						utils.sendLiveStat(e.mid, e.uname, e.title, e.lastLive.online, `https://live.bilibili.com/${e.roomid}`);
					}

					cache.vtb[e.mid].stat = (e.liveStatus === 1);
				}
			})
		});
	}
}

module.exports = {
	plugin: {
		name: 'vtb',
		desc: 'vtb开播监控，直播弹幕监控',
		version: '1.0.0',
		author: '涂山苏苏'
	},
	events: {
		// 事件列表
		onload: (e) => {
			utils.init();

			api.logger.info(`vtb 开始运行`)
		},
		onunload: (e) => {
			if(socket) {
				socket.close();
				socket.disconnect();
			}

			if(timer){
				clearInterval(timer);
			}

			timer = null;
			socket = null;
			api.logger.info(`vtb 停止运行`)
		}
	},
	commands: [
		{
			id: 'info',
			helper: '.vtb info	查看插件信息',
			command: /^\.vtb info$/,
			test: [{
				name: 'vtb插件 info 命令测试',
				cmd: `.vtb info`,
				msg: [
					[
						`数据来源：dd-center (https://vtbs.moe)`,
						`不知道写啥了，就先这样吧（雾`
					].join('\n')
				],
				timeout: 5e2
			}],
			func: async (e) => {
				api.bot.send.group([
					`数据来源：dd-center (https://vtbs.moe)`,
					`不知道写啥了，就先这样吧（雾`
				].join('\n'), e.group);
			}
		},
		{
			id: 'add',
			helper: '.vtb add [uid]	订阅直播通知',
			command: /^\.vtb add (.*)$/,
			test: [{
				name: 'vtb插件 add 命令测试',
				cmd: `.vtb add 0`,
				msg: [
					'[vtb] 订阅成功'
				],
				timeout: 5e2
			}],
			func: async (e) => {
				const uid = e.msg.substr(9);

				const r = api.data.get('vtb', `feed_${uid}`);
				if(r){
					const feed = r.split(',');
					feed.push(e.group);
					api.data.update('vtb', `feed_${uid}`, feed.join(','))
				}else{
					api.data.add('vtb', `feed_${uid}`, e.group);
				}

				api.bot.send.group('[vtb] 订阅成功', e.group);
			}
		},
		{
			id: 'del',
			helper: '.vtb del [uid]	取消订阅直播通知',
			test: [{
				name: 'vtb插件 del 命令测试',
				cmd: `.vtb del 0`,
				msg: [
					'[vtb] 取消成功'
				],
				timeout: 5e2
			}],
			command: /^\.vtb del (.*)$/,
			func: async (e) => {
				const uid = e.msg.substr(9);

				const r = api.data.get('vtb', `feed_${uid}`);
				if(r){
					const feed = r.split(',');
					const tmp = [];
					feed.forEach(n => {
						if(n !== String(e.group)){
							tmp.push(n)
						}
					})
					api.data.update('vtb', `feed_${uid}`, tmp.join(','))
				}

				api.bot.send.group('[vtb] 取消成功', e.group);
			}
		}
	]
}