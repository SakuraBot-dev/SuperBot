const fs = require('fs');
const config = require('../config');
const logger = require('./logger').main;

let adminList = [];

const admin = {
	init: () => {
		if(!fs.existsSync('./admin.json')){
			fs.writeFileSync('./admin.json', JSON.stringify({
				owner: config.owner,
				admin: []
			}));
		}

		const tmp = JSON.parse(fs.readFileSync('./admin.json').toString());
		tmp.admin.forEach(e => {
			adminList.push(e);
		});

		logger.info('管理员列表加载完成');
	},
	saveData: () => {
		try{
			fs.writeFileSync('./admin.json', JSON.stringify({
				owner: config.owner,
				admin: adminList
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
		return adminList.indexOf(qq.toString()) !== -1;
	},
	isOwner: (qq) => {
		return qq.toString() === config.owner;
	},
	addAdmin: (qq) => {
		if(admin.isAdmin(qq)){
			return true;
		}

		adminList.push(qq);
		return admin.saveData();
	},
	removeAdmin: (qq) => {
		if(!admin.isAdmin(qq)){
			return true;
		}

		const tmp = [];
		adminList.forEach(e => {
			if(e !== qq){
				tmp.push(e);
			}
		});

		adminList = tmp;

		return admin.saveData();
	}
}

admin.init();

module.exports = admin;
module.exports.list = adminList;