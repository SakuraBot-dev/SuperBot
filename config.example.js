module.exports = {
	socket: {
		api: '',
		event: ''
	},
	db: {
		// 数据库配置
		host: '',
		user: '',
		database: '',
		password: '',
		port: 0
	},
	plugin: {
		whois: {
			token: ''		// 查询Whois的API
		},
		sec: {
			cookie: ''		// 微步的cookie
		},
		vtb: {
			host: 'https://api.vtbs.moe',		// socket.io的连接地址
			groups: []		// vtb插件消息发送群号
		}
	},
	logger: {
		level: 'DEBUG',		// 日志等级
	},
	owner: ''			// 所属人QQ号
}