const socket = require('./socket');
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();
const test = require('./test');

const isCi = (process.argv.indexOf('ci') !== -1);

// 机器人管理
const bot = {
	send: {
		group: (msg, group_id) => {
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