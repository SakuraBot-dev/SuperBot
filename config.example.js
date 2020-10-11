module.exports = {
	socket: {
		api: '',
		event: ''
	},
  http: {
    url: '',
    token: '',
  },
  webhook: {
    port: 1800,
    host: '0.0.0.0'
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
			limit: 1e4,		// 粉丝大于这个的vtb开播才会被推送
			groups: []		// vtb插件消息发送群号
		},
    steam: {
      key: '23DD63C981FE277F11F07205282013E1',
    },
	},
	logger: {
		level: 'DEBUG',		// 日志等级
	},
	owner: ''			// 所属人QQ号
}