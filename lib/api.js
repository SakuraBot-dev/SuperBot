const bot = require('./bot');
const logger = require('./logger').plugin;
const config = require('../config').plugin;
const fs = require('fs');

const data = {
	/**
	 * @name 插入数据
	 * @param {String} namespace 命名空间
	 * @param {String} key key
	 * @param {String|Object} value value
	 * @return {Boolean}
	 * */
	add: (namespace, key, value) => {
		const path = `./data/${namespace}.json`;

		let v = value;
		if(typeof v === 'object'){
			v = JSON.stringify(value);
		}

		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(r[key]){
				return false;
			}else{
				r[key] = String(v);
				fs.writeFileSync(path, JSON.stringify(r));
				return true;
			}
		}else{
			const r = {};
			r[key] = String(value);
			fs.writeFileSync(path, JSON.stringify(r));
			return true;
		}
	},
	/**
	 * @name 更新数据
	 * @param {String} namespace 命名空间
	 * @param {String} key key
	 * @param {String} value value
	 * @return {Boolean}
	 * */
	update: (namespace, key, value) => {
		const path = `./data/${namespace}.json`;
		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(!r[key]){
				return false;
			}else{
				r[key] = String(value);
				fs.writeFileSync(path, JSON.stringify(r));
				return true;
			}
		}else{
			return false
		}
	},
	/**
	 * @name 删除数据
	 * @param {String} namespace 命名空间
	 * @param {String} key key
	 * @return {Boolean}
	 * */
	delete: (namespace, key) => {
		const path = `./data/${namespace}.json`;
		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(!r[key]){
				return true;
			}else{
				delete r[key];
				fs.writeFileSync(path, JSON.stringify(r));
				return true;
			}
		}else{
			return true;
		}
	},
	/**
	 * @name 读取数据
	 * @param {String} namespace 命名空间
	 * @param {String} key key
	 * @return {String}
	 * */
	get: (namespace, key) => {
		const path = `./data/${namespace}.json`;
		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(!r[key]){
				return null;
			}else{
				return r[key];
			}
		}else{
			return null;
		}
	}
};

module.exports.bot = bot;
module.exports.logger = logger;
module.exports.config = config;
module.exports.data = data;