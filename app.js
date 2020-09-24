const fs = require('fs');
const plugin = require('./plugin');

try{
	fs.mkdirSync('./data');
} catch (e) {
	// fail
}

// 开始加载插件
plugin();