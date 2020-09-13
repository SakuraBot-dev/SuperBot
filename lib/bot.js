const socket = require('./socket');
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();
const test = require('./test');
const logger = require('./logger').main;

const isCi = (process.argv.indexOf('ci') !== -1);

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