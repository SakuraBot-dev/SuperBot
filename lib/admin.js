const fs = require('fs');
const config = require('../config');
const logger = require('./logger').main;

const admin = {
	list: [],
	init: () => {
		if(!fs.existsSync('./admin.json')){
			fs.writeFileSync('./admin.json', JSON.stringify({
				owner: config.owner,
				admin: []
			}));
		}

		const tmp = JSON.parse(fs.readFileSync('./admin.json').toString());
		tmp.admin.forEach(e => {
			admin.list.push(e);
		});

		logger.info('管理员列表加载完成');
	},
	saveData: () => {
		try{
			fs.writeFileSync('./admin.json', JSON.stringify({
				owner: config.owner,
				admin: admin.list
			}));
			return true;
		}catch (e) {
			logger.error(`管理员列表保存失败：${e.message}`);
			return false;
		}
	},
	isAdmin: (qq) => {
		if(admin.isOwner(qq)){
			return true;
		}
		return admin.list.indexOf(qq.toString()) !== -1;
	},
	isOwner: (qq) => {
		return qq.toString() === config.owner;
	},
	addAdmin: (qq) => {
		if(admin.isAdmin(qq)){
			return true;
		}

		admin.list.push(qq);
		return admin.saveData();
	},
	removeAdmin: (qq) => {
		if(!admin.isAdmin(qq)){
			return true;
		}

		admin.list = admin.list.filter(e => e !== qq);

		return admin.saveData();
	}
}

admin.init();

module.exports = admin;
module.exports.list = adminList;