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
	sendLiveStat: (mid) => {
		api.logger.info(`正在推送 ${cache.vtb[mid].name}(${mid}) 的开播信息`);

		api.config.vtb.groups.forEach(group => {
			api.bot.send.group([
				`${cache.vtb[mid].name} 开播了`,
				cache.vtb[mid].title,
				cache.vtb[mid].link,
				`立即与 ${cache.vtb[mid].online} 位小伙伴一起打call~`
			].join('\n'), group)
		});

		api.logger.info(`向 ${api.config.vtb.groups.length} 个群推送开播信息`);
	}
}

let timer = null;

module.exports = {
	plugin: {
		name: 'vtb',
		desc: 'vtb开播监控，直播弹幕监控',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 事件列表
		onload: (e) => {
			socket = io.connect('https://api.vtbs.moe', {
				reconnection: true,
				transports: ['websocket', 'polling']
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
							online: e.online
						}
					}else{
						if(!cache.vtb[e.mid].stat && e.liveStatus === 1){
							// 新开播
							api.logger.debug(JSON.stringify(e));
							utils.sendLiveStat(e.mid);
						}

						cache.vtb[e.mid].link = `https://live.bilibili.com/${e.roomid}`;
						cache.vtb[e.mid].name = e.name;
						cache.vtb[e.mid].title = e.title;
						cache.vtb[e.mid].stat = (e.liveStatus === 1);
						cache.vtb[e.mid].online = e.online;
					}
				})
			});

			api.logger.info(`vtb 开始运行`)
		},
		onunload: (e) => {
			if(socket) {
				socket.removeAllListeners();
				socket.close();
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
			command: /\.vtb info/,
			func: async (e) => {
				api.bot.send.group([
					`数据来源：dd-center (https://vtbs.moe)`,
					`不知道写啥了，就先这样吧（雾`
				].join('\n'), e.group);
			}
		}
	]
}