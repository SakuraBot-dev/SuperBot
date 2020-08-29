const socket = require('./socket');
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();

// 机器人管理
const bot = {
	send: {
		group: (msg, group_id) => {
			socket.send(JSON.stringify({
				action: 'send_group_msg',
				params: {
					group_id: group_id,
					message: msg
				}
			}));
		},
		private: (msg, user_id) => {
			socket.send(JSON.stringify({
				action: 'send_private_msg',
				params: {
					user_id: user_id,
					message: msg
				}
			}))
		}
	}
}

socket.on_group_msg = (e) => {
	emitter.emit('group_msg', e);
};

socket.on_private_msg = (e) => {
	emitter.emit('private_msg', e);
}

module.exports = bot;
module.exports.event = emitter;