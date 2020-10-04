const api = require('../lib/api');

module.exports = {
	plugin: {
		name: 'GitHub Webhook',
		desc: 'GitHub Webhook',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		onload: async () => {
			api.logger.info('GitHub Webhook 开始运行');
		},
		onunload: () => {
			api.logger.info('GitHub Webhook 停止运行');
		}
	},
  commands: [],
  webhook: [{
    id: 'github',
    path: /^\/webhook\/github\/(.*)/,
    method: 'post',
    func: async (req) => {
			const group = req.url.split('/').pop();
			const event = req.headers['x-github-event'];

			if(event === 'push'){
				const commits = [];

				Object.keys(req.body.commits).forEach(index => {
					const commit = req.body.commits[index];
					commits.push(`${commit.id.substr(0, 7)}: ${commit.message.split('\n')[0]} by ${commit.committer.name}`);
				});

				api.bot.socket.send.group([
					`🔨${Object.keys(req.body.commits).length} new commits to ${req.body.repository.full_name}`,
					'',
					commits
				].join('\n'), group);
			}else if(event === 'pull_request'){
				if(req.body.action === 'opened'){
					api.bot.socket.send.group(`🔌 New pull request ${req.body.pull_request.title}#${req.body.number} by: ${req.body.pull_request.user.login}`, group);
				}
			}else if(event === 'issues'){
				if(req.body.action === 'opened'){
					api.bot.socket.send(`🐛 New issue ${req.body.repository.full_name}#${req.body.issue.number} ${req.body.issue.title} by ${req.body.issue.user.login}`, group);
				}
			}
      return 'success';
    }
  }]
}