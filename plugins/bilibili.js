const api = require('../lib/api');
const db = require('../lib/db');
const admin = require('../lib/admin');
const RateLimiter = require('limiter').RateLimiter;
const request = require('request');
const limiter = new RateLimiter(8, 'second');

const bili = {
	feed: {},
	cache: {},
	offset: 0,
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
		},
		init: async () => {
			const list = await db.select('*').from('bili').queryList();
			bili.feed = {};
			list.forEach(e => {
				bili.cache[e.uid] = {
					video: e.video,
					live: e.liveStat
				};

				if(!bili.feed[e.uid]){
					bili.feed[e.uid] = [];
				}

				bili.feed[e.uid].push(e.group);
			});

			return true;
		},
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
		const uid = Object.keys(bili.feed)[bili.offset];
		const groups = bili.feed[uid];

		if(!uid || !groups){
			return;
		}

		bili.offset++;
		if(!Object.keys(bili.feed)[bili.offset]){
			bili.offset = 0;
		}

		const liveStat = await bili.api.liveStat(uid);
		const latestVideo = await bili.api.latestVideo(uid);
		const user = await bili.api.info(uid);

		db.update('bili', {
			name: user.name
		}).where('uid', uid).execute();
		if(liveStat){
			if(liveStat.liveStatus === 1 && bili.cache[uid].liveStat === 'disable'){
				// 新开播
				db.update('bili', {
					liveStat: 'enable'
				}).where('uid', uid).execute();

				bili.cache[uid].liveStat = 'enable';

				groups.forEach(group => {
					api.bot.send.group([
						`您订阅的 ${user.name} 开播了`,
						liveStat.title,
						`链接：${liveStat.url}`
					].join('\n'), group);
				})
			}

			if(liveStat.liveStatus === 0 && bili.cache[uid].liveStat ===  'enable'){
				// 下播
				bili.cache[uid].liveStat = 'disable';

				db.update('bili', {
					liveStat: 'disable'
				}).where('uid', uid).execute();
			}
		}

		if(latestVideo && latestVideo.bvid !== bili.cache[uid].video) {
			// 新视频发布
			bili.cache[uid].video = latestVideo.bvid;

			db.update('bili', {
				video: latestVideo.bvid
			}).where('uid', uid).execute();

			groups.forEach(group => {
				api.bot.send.group([
					`您订阅的 ${user.name} 发布了新视频`,
					`标题：${latestVideo.title}`,
					`链接：https://b23.tv/${latestVideo.bvid}`
				].join('\n'), group);
			});
		}
	}
}

let timer = null;

module.exports = {
	plugin: {
		name: '哔哩哔哩',
		desc: '哔哩哔哩 直播，更新 推送',
		version: '0.0.2',
		author: '涂山苏苏'
	},
	events: {
		// 事件列表
		onload: async (e) => {
			await bili.utils.init();
			timer = setInterval(() => {
				bili.update().then(r => {});
			}, 500);
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

				if(!admin.isAdmin(e.sender.user_id)){
					api.bot.send.group('¿', e.group);
					return;
				}

				if(bili.feed[uid]){
					api.bot.send.group('[Bili] 已经订阅过了这个up主', e.group);
				}

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

				if(!admin.isAdmin(e.sender.user_id)){
					api.bot.send.group('¿', e.group);
					return;
				}

				await db.delete('bili').where('uid', uid).where('group', group).execute();
				await bili.utils.init();
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
				if(!admin.isAdmin(e.sender.user_id)){
					api.bot.send.group('¿', e.group);
					return;
				}

				await bili.update();
				api.bot.send.group('[Bili] 更新成功', e.group);
			}
		}
	]
}