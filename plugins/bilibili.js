const api = require('../lib/api');
const db = require('../lib/db');
const RateLimiter = require('limiter').RateLimiter;
const request = require('request');
const limiter = new RateLimiter(20, 'second');

const bili = {
	utils: {
		request: {
			get: (uri) => {
				return new Promise(r => {
					if(limiter.tryRemoveTokens(1)){
						request({
							uri: encodeURI(uri),
							header: {
								'referer': 'https://space.bilibili.com/',
								'origin': 'https://space.bilibili.com',
								'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'
							}
						}, (err, res, body) => {
							if(err || res.statusCode !== 200){
								r([false, '请求错误']);
							}else{
								r([true, body])
							}
						});
					}else{
						api.logger.warn('超出限流策略，正在重试');
						setTimeout(() => {
							bili.utils.request.get(uri).then(e => {
								r(e);
							})
						}, 5e2);
					}
				})
			}
		}
	},
	api: {
		liveStat: async (uid) => {
			const r = await bili.utils.request.get(`https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid=${uid}`)
			if(r[0]){
				const e = JSON.parse(r[1]);
				if(e.code === 0){
					return e.data;
				}else{
					api.logger.warn(`直播状态更新失败: ${e.message}`);
					return false;
				}
			}else{
				api.logger.warn(`直播状态更新失败: ${r[1]}`)
				return false;
			}
		},
		latestVideo: async (uid) => {
			const r = await bili.utils.request.get(`https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=1&tid=0&pn=1&keyword=&order=pubdate&jsonp=jsonp`)
			if(r[0]){
				const e = JSON.parse(r[1]);
				if(e.code === 0){
					return e.data.list.vlist[0];
				}else{
					api.logger.warn(`最新视频读取失败: ${e.message}`);
					return false;
				}
			}else{
				api.logger.warn(`最新视频读取失败: ${r[1]}`)
				return false;
			}
		},
		info: async (uid) => {
			const r = await bili.utils.request.get(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`);
			if(r[0]){
				const e = JSON.parse(r[1]);
				if(e.code === 0){
					return e.data;
				}else{
					api.logger.warn(`用户信息读取失败: ${e.message}`);
					return false;
				}
			}else{
				api.logger.warn(`用户信息读取失败: ${r[1]}`)
				return false;
			}
		}
	},
	update: async () => {
		api.logger.info(`Bili 正在更新订阅`);
		const biliList = await db.select('*').from('bili').queryList();
		for (const e of biliList) {
			const uid = e.uid;
			const liveStat = await bili.api.liveStat(uid);
			const latestVideo = await bili.api.latestVideo(uid);
			const user = await bili.api.info(uid);


			db.update('bili', {
				name: user.name
			}).where('id', e.id).execute();

			if(liveStat.liveStatus === 1 && e.liveStat === 'disable'){
				// 新开播
				db.update('bili', {
					liveStat: 'enable'
				}).where('id', e.id).execute();

				api.bot.send.group([
					`您订阅的 ${user.name} 开播了`,
					liveStat.title,
					`链接：${liveStat.url}`
				].join('\n'), e.group);
			}

			if(liveStat.liveStatus === 0 && e.liveStat === 'enable'){
				// 下播
				db.update('bili', {
					liveStat: 'disable'
				}).where('id', e.id).execute();
			}

			if(latestVideo.bvid !== e.video) {
				// 新视频发布
				db.update('bili', {
					video: latestVideo.bvid
				}).where('id', e.id).execute();

				api.bot.send.group([
					`您订阅的 ${user.name} 发布了新视频`,
					`标题：${latestVideo.title}`,
					`链接：https://b23.tv/${latestVideo.bvid}`
				].join('\n'), e.group);
			}
		}
		api.logger.info(`Bili 订阅更新完成`);
	}
}

let timer = null;

module.exports = {
	plugin: {
		name: '哔哩哔哩',
		desc: '哔哩哔哩 直播，更新 推送',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 事件列表
		onload: (e) => {
			timer = setInterval(() => {
				bili.update().then(r => {});
			}, 3e4);
			api.logger.info('哔哩哔哩 开始运行');
		},
		onunload: (e) => {
			clearInterval(timer)
			api.logger.info('哔哩哔哩 停止运行');
		}
	},
	commands: [
		{
			id: 'add',
			helper: '.bili add [uid] 订阅up主',
			command: /\.bili add (.*)/,
			func: async (e) => {
				const uid = e.msg.substr(10);
				const sender = e.sender.user_id;

				const user = await bili.api.info(uid);
				if(!user){
					api.bot.send.group('[Bili] 订阅失败：用户信息拉取失败', e.group);
				}else{
					await db.insert('bili', {
						uid: uid,
						owner: sender,
						group: e.group,
						liveStat: 'disable',
						video: '',
					}).execute();

					api.bot.send.group('[Bili] 订阅成功', e.group);
				}
			}
		},
		{
			id: 'del',
			helper: '.bili del [uid] 删除订阅',
			command: /\.bili del (.*)/,
			func: async (e) => {
				const uid = e.msg.substr(10);
				const group = e.group;

				await db.delete('bili').where('uid', uid).where('group', group).execute();
				api.bot.send.group('[Bili] 删除成功', e.group);
			}
		},
		{
			id: 'ls',
			helper: '.bili ls 查看订阅列表',
			command: /\.bili ls/,
			func: async (e) => {
				const group = e.group;

				const r = await db.select('*').from('bili').where('group', group).queryList();
				const msg = [];
				for (const d of r) {
					msg.push(`${d.uid}: ${d.name}`);
				}

				api.bot.send.group(msg.join('\n'), group);
			}
		},
		{
			id: 'update',
			helper: '.bili update 手动更新订阅',
			command: /\.bili update/,
			func: async (e) => {
				await bili.update();
				api.bot.send.group('[Bili] 更新成功', e.group);
			}
		}
	]
}