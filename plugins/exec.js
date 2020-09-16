const api = require('../lib/api');
const admin = require('../lib/admin');
const util = require('util');
const p = require('child_process');

module.exports = {
    plugin: {
        name: 'HELP',
        desc: 'HELP',
        version: '0.0.1',
        author: '涂山苏苏'
    },
    events: {
        onload: async(e) => {
            api.logger.info('HELP 开始运行');
        },
        onunload: (e) => {
            api.logger.info('HELP 停止运行');
        }
    },
    commands: [{
            id: 'eval',
            helper: '.eval [code]	直接运行js代码',
            command: /^\.eval (.*)$/,
            func: async(e) => {
                const code = e.msg.substr(6);

                if (!admin.isOwner(e.sender.user_id)) {
                    api.bot.socket.send.group('[exec] 你想干啥¿', e.group);
                } else {
                    try {
                        let result = eval(code);

                        if (typeof result !== 'string') {
                            result = util.inspect(result);
                        }

                        api.bot.socket.send.group(result, e.group);
                    } catch (err) {
                        api.bot.socket.send.group('执行出错', e.group);
                        api.bot.socket.send.group(util.inspect(err), e.group())
                    }
                }
            }
        },
        {
            id: 'exec',
            helper: '.exec [code]	运行shell',
            command: /^\.exec (.*)$/,
            func: async(e) => {
                const code = e.msg.substr(6);

                if (!admin.isOwner(e.sender.user_id)) {
                    api.bot.socket.send.group('[exec] 你想干啥¿', e.group);
                } else {
                    try {
                        let _p = p.exec(code);

                        _p.stdout.on('data', (data) => {
                            api.bot.socket.send.group(data.toString().trim(), e.group);
                        });

                        _p.on('exit', (code, sign) => {
                            api.bot.socket.send.group(`进程退出, code: ${code}, sign: ${sign}`, e.group);
                        });
                    } catch (err) {
                        api.bot.socket.send.group('执行出错', e.group);
                        api.bot.socket.send.group(util.inspect(err), e.group())
                    }
                }
            }
        }
    ]
}