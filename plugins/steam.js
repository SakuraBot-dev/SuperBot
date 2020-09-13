const api = require('../lib/api');
const util = require('util');
const request = require('request');

const steam = {
	timer: null,
	cache: {},
	utils: {
		request: {
			/**
			 * @name 发送GET请求
			 * @param {String} url URL
			 * @param {Object} args url参数
			 * @return {Promise} body
			 * */
			get: (url, args) => {
				return new Promise(r => {
					const arg = [];

					Object.keys(args).forEach(e => {
						arg.push(`${e}=${args[e]}`);
					})

					request(`${url}?${arg.join('&')}`, (err, res, body) => {
						if(err || res.statusCode !== 200){
							api.logger.warn(`API 请求错误, statusCode: ${res.statusCode}, err: ${util.inspect(err)}`);
							r(null);
						}else{
							r(body);
						}
					})
				})
			},
			/**
			 * @name 发送POST请求
			 * @param {String} url URL
			 * @param {Object} args url参数
			 * @param {String} body body
			 * @return {Promise} body
			 * */
			post: (url, args, body) => {
				return new Promise(r => {
					const arg = [];

					Object.keys(args).forEach(e => {
						arg.push(`${e}=${args[e]}`);
					})

					request({
						uri: `${url}?${arg.join('&')}`,
						body: body
					}, (err, res, body) => {
						if(err || res.statusCode !== 200){
							api.logger.warn(`API 请求错误, statusCode: ${res.statusCode}, err: ${util.inspect(err)}`);
							r(null);
						}else{
							r(body);
						}
					})
				});
			}
		},
		group: (array, subGroupLength) => {
			let index = 0;
			let newArray = [];

			while(index < array.length) {
				newArray.push(array.slice(index, index += subGroupLength));
			}

			return newArray;
		}
	},
	api: {
		/**
		 * @name 获取游戏状态
		 * @param {Array} ids steam用户id列表
		 * */
		getGameStat: async (ids) => {
			const result = await steam.utils.request.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`, {
				key: api.config.steam.key,
				format: 'json',
				steamids: ids.join(',')
			});

			if(result && Object.keys(JSON.parse(result).response.players).length > 0){
				const data = JSON.parse(result);

				const players = {};

				Object.keys(data.response.players).forEach(i => {
					const e = data.response.players[i];
					players[e.steamid] = e;
				});

				return players;
			}else{
				return null;
			}
		}
	},
	bot: {
		list: [],
		offset: 0,
		update: async () => {
			const ids = api.data.get('steam', 'feed');

			if(!ids) return;

			const id = steam.utils.group(ids, 100);

			const p = [];

			id.forEach(e => {
				p.push(steam.api.getGameStat(e));
			})

			const r = await Promise.all(p);

			r.forEach(e => {
				Object.keys(e).forEach(id => {
					if(e[id].gameextrainfo){
						if(steam.cache[id] !== e[id].gameextrainfo){
							// 启动游戏
							steam.cache[id] = e[id].gameextrainfo;

							const r = api.data.get('steam', `feed_${id}`);
							r.forEach(group => {
								api.bot.socket.send.group(`${e[id].personaname} 正在游玩 ${e[id].gameextrainfo}`, group)
							})
						}
					}else{
						if(steam.cache[id]){
							// 关闭游戏
							steam.cache[id] = null;
						}
					}
				})
			})

			steam.bot.offset++;
		}
	}
};

module.exports = {
	plugin: {
		name: 'steam',
		desc: 'steam',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: async (e) => {
			api.logger.info('steam 开始运行')

			await steam.bot.update();

			steam.timer = setInterval(() => {
				steam.bot.update();
			}, 3e4)
		},
		// 卸载
		onunload: (e) => {
			clearInterval(steam.timer);
			steam.timer = null;

			api.logger.info('steam 停止始运行')
		}
	},
	commands: [
		{
			id: 'stat',
			helper: '.steam stat [id] 查询游戏状态',
			command: /^\.steam stat (.*)$/,
			func: async (e) => {
				const id = e.msg.substr(12);
				const r = (await steam.api.getGameStat([id]))[id];

				if(r.gameextrainfo){
					api.bot.socket.send.group(`${r.personaname} 正在游玩 ${r.gameextrainfo}`, e.group)
				}else{
					api.bot.socket.send.group(`${r.personaname} 没玩游戏`, e.group)
				}
			}
		},
		{
			id: 'add',
			helper: '.steam add [id] 添加提醒',
			command: /^\.steam add (.*)$/,
			func: async (e) => {
				const id = e.msg.substr(11);
				const r = api.data.get('steam', 'feed');
				if(r){
					r.push(id);
					api.data.update('steam', 'feed', r);
				}else{
					api.data.add('steam', 'feed', [id]);
				}


				const f = api.data.get('steam', `feed_${id}`);
				if(r){
					f.push(id);
					api.data.update('steam', `feed_${id}`, f);
				}else{
					api.data.add('steam', `feed_${id}`, [e.group]);
				}

				api.bot.socket.send.group('[Steam] 订阅成功', e.group);
			}
		},
		{
			id: 'del',
			helper: '.steam del [id] 删除提醒',
			command: /^\.steam del (.*)$/,
			func: async (e) => {
				const id = e.msg.substr(11);
				const r = api.data.get('steam', 'feed');
				r.filter(e => e !== id);
				api.data.update('steam', 'feed', r);


				const f = api.data.get('steam', `feed_${id}`);
				f.filter(e => e !== e.group);
				api.data.update('steam', `feed_${id}`, f);

				api.bot.socket.send.group('[Steam] 取消成功', e.group);
			}
		}
	]
}