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

		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(r[key]){
				return false;
			}else{
				r[key] = value;
				fs.writeFileSync(path, JSON.stringify(r));
				return true;
			}
		}else{
			const r = {};
			r[key] = value;
			fs.writeFileSync(path, JSON.stringify(r));
			return true;
		}
	},
	/**
	 * @name 更新数据
	 * @param {String} namespace 命名空间
	 * @param {String} key key
	 * @param {String|Object} value value
	 * @return {Boolean}
	 * */
	update: (namespace, key, value) => {
		const path = `./data/${namespace}.json`;
		if(fs.existsSync(path)){
			const r = JSON.parse(fs.readFileSync(path).toString())
			if(!r[key]){
				return false;
			}else{
				r[key] = value;
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

const utils = {
	cqCode: {
		/**
		 * @name CQ码转义 encode
		 * @param {String} input
		 * */
		encode: (input) => {
			return input.replace(/,/g, '&#44;').replace(/&/g, '&amp;').replace(/\[/g, '&#91;').replace(/]/g, '&#93;');
		},
		/**
		 * @name CQ码转义 decode
		 * @param {String} input
		 * */
		decode: (input) => {
			return input.replace(/&#44;/g, ',').replace(/&amp;/g, '&').replace(/&#91;/g, '[').replace(/&#93;/g, ']');
		}
	},
	/**
	 * @name 生成n到m的随机数
	 * @param {Number} n
	 * @param {Number} m
	 * @return {Number} 随机数
	 * */
	random: (n,m) => {
		return Math.floor(Math.random()*(m-n+1))+n;
	},
	isNumber: (input) => {
		return Number(input) == input;
	}
}

module.exports.bot = bot;
module.exports.logger = logger;
module.exports.config = config;
module.exports.data = data;
module.exports.utils = utils;