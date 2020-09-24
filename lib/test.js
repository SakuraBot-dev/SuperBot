const tasks = [];

let cache = [];

let offset = 0;
let msg_offset = 0;

let started = false;

const doTask = async () => {

	const task = tasks[offset];
	const startAt = new Date().getTime();

	msg_offset = 0;

	try{
		await task.func({
			msg: task.cmd,
			sender: 10001,
			self: 10000,
			time: new Date(),
			group: 10002
		});
	}catch (e) {
		tasks[offset].pass = false;
		tasks[offset].reason = e.message;
	}

	while(tasks[offset].pass === null){
		if(new Date().getTime() - task.timeout >= startAt){
			tasks[offset].reason = 'timeout';
			break;
		}
	}

	// 本轮测试结束
	tasks[offset].time = new Date().getTime() - startAt;

	offset++;

	if(tasks[offset]){
		// 下一轮测试
		await doTask(offset);
	}else{
		// 测试结束
		let succ = true;

		tasks.forEach(e => {
			if(e.pass === true){
				console.log(`✔ ${e.name} (${e.time} ms) succeed`);
			}else{
				succ = false;
				console.log(`❌ ${e.name} (${e.time} ms) ${e.reason}`);
			}
		})

		if(succ){
			process.exit(0);
		}else{
			process.exit(1);
		}
	}
};

const test = {
	/**
	 * @name 运行测试
	 * @param {Object} plugin 插件对象
	 * */
	run: (plugin) => {
		plugin.in.commands.forEach(e => {
			if(e.test){
				test.regTest(e.test, e.func);
			}
		})
	},
	/**
	 * @name 注册测试
	 * @param {Array} test 测试配置
	 * @param {Function} func 命令的function
	 * */
	regTest: (test, func) => {
		test.forEach(e => {
			tasks.push({
				name: e.name,
				cmd: e.cmd,
				msg: e.msg,
				timeout: e.timeout,
				func: func,
				pass: null,
			});
		});

		if(!started){
			started = true;
			// 等一会让它加载被测试的命令
			setTimeout(async () => {
				await doTask();
			}, 5e3)
		}
	},
	api: {
		group: (msg) => {
			if(new RegExp(tasks[offset].msg[msg_offset]).test(msg) || tasks[offset].msg[msg_offset] === msg){
				if(msg_offset === 0) cache = [];
				msg_offset++;

				if(tasks[offset].pass !== false){
					cache.push(true);
					if(cache.length === tasks[offset].msg.length){
						let fullTrue = true;
						cache.forEach(e => {
							if(!e) fullTrue = false;
						});

						tasks[offset].pass = fullTrue;
					}
				}
			}else{
				tasks[offset].pass = false;
			}
		}
	}
}

module.exports = test;