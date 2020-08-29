const api = require('../lib/api');
const p = require('child_process');

let nmap = null;
let timer = null;
let msgQueue = [];

const block = (input) => {
	if(input.indexOf('|') !== -1) return true;
	if(input.indexOf('&') !== -1) return true;
	if(input.indexOf('>') !== -1) return true;
	if(input.indexOf(';') !== -1) return true;
	if(input.indexOf(' ') !== -1) return true;
	if(input.indexOf('127.0.0.1') !== -1) return true;
	if(input.indexOf('localhost') !== -1) return true;
	if(input.match(/127\.(.*)/)) return true;
	if(input.match(/10\.(.*)/)) return true;
	if(input.match(/192\.168\.(.*)/)) return true;
	if(input.match(/^0\.(.*)/)) return true;
	return false;
}

module.exports = {
	plugin: {
		name: 'nmap',
		desc: '使用nmap进行扫描',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: (e) => {
			api.logger.info(`nmap 开始运行`);
		},
		// 卸载
		onunload: (e) => {
			if(nmap) nmap.kill(9);
			api.logger.info(`nmap 停止运行`);
		}
	},
	commands: [
		{
			id: 'nmap',
			helper: '.nmap [IP/域名] 启动nmap扫描域名或IP',
			command: /\.nmap\ (.*)/,
			func: async (e) => {
				const ip = e.msg.substr(6);

				if(block(ip)){
					api.bot.send.group('你想干啥？', e.group);
					return;
				}

				if(nmap){
					api.bot.send.group('已经有一个正在运行的扫描了', e.group);
				}else{
					timer = setInterval(() => {
						api.bot.send.group(msgQueue.join('\n'), e.group);
						msgQueue = [];
					},5e2);

					nmap = p.exec(`nmap -A -T5 -v4 ${ip}`);

					nmap.stdout.on('data', (data) => {
						msgQueue.push(data.toString().trim());
					});

					nmap.on('exit', (code, sign) => {
						msgQueue.push(`nmap进程退出, code: ${code}, sign: ${sign}`);
						api.bot.send.group(msgQueue.join('\n'), e.group);
						clearInterval(timer);
						nmap = null;
					});
				}
			}
		}
	]
}