const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv;

if(args.indexOf('add')){
	// 安装插件
	if(args.indexOf('--git')){
		const index = args.indexOf('--git') + 1;

		const repo = args[index];
		const name = repo.split('/').pop().split('.')[0];
		const cwd = path.join(__dirname, `./plugins/${name}`);

		fs.mkdirSync(cwd);

		// 下载插件
		console.log('Cloning repo...')

		child_process.execSync(`git clone ${repo} .`, {
			cwd: cwd
		});

		// 安装插件依赖
		console.log(`Installing dependencies...`);

		const p = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json')).toString());
		if(p.dependencies){
			Object.keys(p.dependencies).forEach(name => {
				const version = p.dependencies[name];
				child_process.execSync(`npm install ${name}@${version}`, {
					cwd: __dirname
				});
			})
		}

		console.log('Done!');
	}else{
		console.log('Unsupported!');
	}
}else{
	console.log('Unsupported!');
}