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
			groups: []		// vtb插件消息发送群号
		}
	},
	logger: {
		level: '',		// 日志等级
	},
	owner: ''			// 所属人QQ号
}