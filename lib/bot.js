const socket = require('./socket');
const util = require('util');
const config = require('../config');
const request = require('request');
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();
const test = require('./test');
const logger = require('./logger').main;

const isCi = (process.argv.indexOf('ci') !== -1);

const utils = {
	request: {
		/**
		 * @name 发送GET请求
		 * @param {String} path 请求路径
		 * @param {Object} args URL参数
		 * */
		get: (path, args) => {
			return new Promise(r => {
				const arg = [];

				Object.keys(args).forEach(e => {
					arg.push(`${e}=${args[e]}`);
				});

				arg.push(`access_token=${config.http.token}`);

				request(encodeURI(`${config.http.url}${path}?${arg.join('&')}`), (err, res, body) => {
					if(err){
						logger.warn(`HTTP-API ${path}?${arg.join('&')} ${util.inspect(err)}`);
						r(null);
					}else if(res.statusCode !== 200){
						logger.warn(`HTTP-API ${path}?${arg.join('&')} statusCode: ${res.statusCode}`);
						r(null);
					}else{
						r(JSON.parse(body));
					}
				})
			})
		},
		/**
		 * @name 发送POST请求
		 * @param {String} path 请求路径
		 * @param {Object} args URL参数
		 * @param {String} body Body
		 * */
		post: (path,args,body) => {
			return new Promise(r => {
				const arg = [];

				Object.keys(args).forEach(e => {
					arg.push(`${e}=${args[e]}`);
				});

				arg.push(`access_token=${config.http.token}`);

				request({
					uri: encodeURI(`${config.http.url}${path}?${arg.join('&')}`),
					body: body
				}, (err, res, body) => {
					if(err){
						logger.warn(`HTTP-API ${path}?${arg.join('&')} ${util.inspect(err)}`);
						r(null);
					}else if(res.statusCode !== 200){
						logger.warn(`HTTP-API ${path}?${arg.join('&')} statusCode: ${res.statusCode}`);
						r(null);
					}else{
						r(JSON.parse(body));
					}
				})
			})
		}
	}
}

// 机器人管理
const bot = {
	socket: {
		send: {
			group: (msg, group_id) => {
				module.exports.stat.send++;

				logger.debug(`SOCKET 向 ${group_id} 发送群消息: ${msg}`);

				if(isCi){
					test.api.group(msg, group_id);
					return;
				}
				socket.send(JSON.stringify({
					action: 'send_group_msg',
					params: {
						group_id: group_id,
						message: msg
					}
				}));
			},
			private: (msg, user_id) => {
				module.exports.stat.send++;

				logger.debug(`SOCKET 向 ${user_id} 发送私聊消息: ${msg}`);

				if(isCi){
					return;
				}
				socket.send(JSON.stringify({
					action: 'send_private_msg',
					params: {
						user_id: user_id,
						message: msg
					}
				}))
			},
			raw: (data) => {
				module.exports.stat.raw++;

				logger.debug(`SOCKET 发送RAW消息: ${JSON.stringify(data)}`);

				if(isCi){
					return;
				}
				socket.send(JSON.stringify(data));
			}
		}
	},
	http: {
		send: {
			group: async (msg, group_id) => {
				module.exports.stat.send++;

				logger.debug(`HTTP 向 ${group_id} 发送群消息: ${msg}`);

				return await utils.request.get('/send_group_msg', {
					group_id: group_id,
					message: msg
				});
			},
			private: async (msg, user_id) => {
				module.exports.stat.send++;

				logger.debug(`HTTP 向 ${user_id} 发送私聊消息: ${msg}`);

				return await utils.request.get('/send_private_msg', {
					user_id: user_id,
					message: msg
				});
			}
		},
		get: {
			/**
			 * @name 获取登录信息
			 * @return {Object}
			 * */
			login_info: async () => {
				return await utils.request.get('/get_login_info', {});
			},
			/**
			 * @name 好友列表
			 * @return {Object}
			 * */
			friend_list: async () => {
				return await utils.request.get('/get_friend_list', {});
			},
			/**
			 * @name 群列表
			 * @return {Object}
			 * */
			group_list: async () => {
				return await utils.request.get('/get_group_list', {});
			},
			/**
			 * @name 获取群信息
			 * @param {String} group_id,
			 * @param {Boolean} cache
			 * @return {Object}
			 * */
			group_info: async (group_id ,cache) => {
				return await utils.request.get('/get_group_info', {
					group_id: group_id,
					no_cache: !cache
				});
			}
		},
		/**
		 * @name 撤回消息
		 * @param {Number} id 消息id
		 * */
		delete_msg: async (id) => {
			return await utils.request.get('/get_group_info', {
				message_id: id
			});
		}
	}
}

socket.on_group_msg = (e) => {
	module.exports.stat.receive++;
	emitter.emit('group_msg', e);
};

socket.on_private_msg = (e) => {
	module.exports.stat.receive++;
	emitter.emit('private_msg', e);
}

emitter.setMaxListeners(Number.MAX_SAFE_INTEGER);

module.exports = bot;
module.exports.event = emitter;
module.exports.stat = {
	send: 0,			// 发送消息数
	receive: 0,		// 接受消息数
	raw: 0,				// 原始消息数
};