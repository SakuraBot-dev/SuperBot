const rss = require('rss-parser');
const admin = require('../lib/admin');
const api = require('../lib/api')
const db2 = require('../lib/db2'); //json数据库

const n = {};
const parser = new rss()

const update = async() => {
    api.logger.info(`RSS 开始更新订阅`);
    const r = await db2.read().get(`rss[feed]`).value();
    for (const _rss of r) {
        parser.parseURL(_rss.url).then(async rss_result => {
            const id = rss_result.items[0].link; //最新的
            //console.log(rss_result);
            //console.log(id)
            //console.log(_rss.last_id)
            let index = 0;
            let i = 0;
            let s = "";
            for (i = 0; i < rss_result.items.length; i++) { //判断更新了多少条
                if (_rss.last_id == rss_result.items[i].link) {
                    break;
                } else {
                    index++;
                }
            }
            for (i = 0; i < index; i++) { //确认要更新多少后，开始转发
                s = s + [
                    `[RSS] 您订阅的 ${rss_result.title.trim()} 更新了`,
                    `标题：${rss_result.items[i].title.trim()}`,
                    `链接：${rss_result.items[i].link}`
                ].join('\n') + "\n";
            }
            //console.log(groups.group);
            if (index > 0) { //有更新才转发
                api.bot.send.group(s, _rss.group);
                db2.read().get(`rss[feed]`).find({
                    id: _rss.id
                }).assign({
                    last_id: id
                }).write();
            }
        }).catch(e => {
            api.logger.warn(`RSS 更新失败, url: ${_rss.url}, err: ${JSON.stringify(e)}`);
        })
    }
    api.logger.info(`RSS 订阅更新完成`);
}

module.exports = {
    plugin: {
        name: 'RSS订阅器',
        desc: 'RSS订阅器',
        version: '0.0.1',
        author: '涂山苏苏'
    },
    events: {
        // 加载
        onload: (e) => {
            n.timer = setInterval(async() => {
                await update();
            }, 3e4);
            api.logger.info(`RSS RSS订阅器开始运行`);
        },
        // 卸载
        onunload: (e) => {
            clearInterval(n.timer);
            api.logger.info(`RSS RSS订阅器停止运行`);
        }
    },
    commands: [{
            id: 'add',
            helper: '。rss add [链接]	添加订阅',
            command: /^。rss add (.*)$/,
            func: async(e) => {
                const link = e.msg.substr(9);
                /*
 https://www.w3school.com.cn/js/jsref_substr.asp JavaScript substr() 方法
参数	描述
start	必需。要抽取的子串的起始下标。必须是数值。如果是负数，那么该参数声明从字符串的尾部开始算起的位置。也就是说，-1 指字符串中最后一个字符，-2 指倒数第二个字符，以此类推。
length	可选。子串中的字符数。必须是数值。如果省略了该参数，那么返回从 stringObject 的开始位置到结尾的字串。
 */
                const group = e.group;
                const sender = e.sender.user_id;

                if (!admin.isAdmin(e.sender.user_id)) {
                    api.bot.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
                    return;
                }

                if (/^(http(s)?:\/\/)\w+[^\s]+(\.[^\s]+){1,}$/g.test(link)) {
                    parser.parseURL(link).then(async e => {
                        if (await db2.read().get(`rss[feed]`).find({
                                url: link,
                                group: group
                            }).value() == undefined) {
                            let id = parseInt(new Date().getTime() / 1000);
                            await db2.read().get(`rss[feed]`)
                                .push({
                                    id: id,
                                    url: link,
                                    group: group,
                                    user: sender,
                                    status: "enable",
                                    last_id: ""
                                })
                                .write();
                            api.bot.send.group('[RSS] 订阅成功', group);
                        } else {
                            api.bot.send.group('[RSS] 该rss已订阅', group);
                        }
                    }).catch(e => {
                        api.bot.send.group('[RSS] 订阅失败：' + e, group);
                    });
                } else {
                    api.bot.send.group('[RSS] 请填写正确的链接', group);
                }
            }
        },
        {
            id: 'remove',
            helper: '。rss del [id]	删除订阅',
            command: /^。rss del (.*)$/,
            func: async(e) => {
                const id = e.msg.substr(9);
                const group = e.group;
                //console.log(id);
                if (!admin.isAdmin(e.sender.user_id)) {
                    api.bot.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
                    return;
                }
                try {
                    //console.log(await db2.read().get(`rss[feed]`).find({
                    //    id: parseInt(id)
                    //}).value())
                    if (await db2.read().get(`rss[feed]`).find({
                            id: parseInt(id)
                        }).value() != undefined) {
                        await db2.read().get(`rss[feed]`)
                            .remove({
                                id: parseInt(id)
                            })
                            .write();
                        api.bot.send.group('[RSS] 删除成功', group);
                    } else {
                        api.bot.send.group('[RSS] 该rss不存在，无法删除', group);
                    }
                } catch (e) {
                    api.bot.send.group('[RSS] 删除失败:' + e, group);
                }
            }
        },
        {
            id: 'list',
            helper: '。rss list	查看本群订阅列表',
            command: /。rss list/,
            func: async(e) => {
                try {
                    let s1 = "";
                    let data = db2.read().get(`rss[feed]`).filter({
                        group: e.group
                    }).value();
                    //console.log(data);
                    if (data.length != 0) {
                        //console.log(data.length);
                        for (let i = 0; i < data.length; i++) {
                            //console.log(data[i].id);
                            //console.log(data[i].url);
                            //console.log(data[i].group);
                            //console.log(data[i].user);
                            //console.log(data[i].status);
                            s1 += "id: " + data[i].id + " , ";
                            s1 += "url：" + data[i].url;
                            //s1 += "group: " + data[i].group;
                            //s2 += "user:" + data[i].user + "\n";
                            //s2 += "status:" + data[i].status;
                            s1 += "\n";
                        }
                        api.bot.send.group(s1, e.group);
                        //console.log(s1);
                    } else {
                        api.bot.send.group('[RSS] 这个群还没有订阅任何内容', e.group);
                    }
                } catch (e) {
                    api.bot.send.group('[RSS] 查询失败：' + e, e.group);
                }
            }
        },
        {
            id: 'update',
            helper: '。rss update	立刻刷新订阅',
            command: /。rss update/,
            func: async(e) => {
                if (!admin.isAdmin(e.sender.user_id)) {
                    api.bot.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
                    return;
                }
                await update();
                api.bot.send.group('[RSS] 刷新成功', e.group);
            }
        },
        {
            id: 'help',
            helper: '。rss help	rss帮助说明',
            command: /。rss help/,
            func: async(e) => {
                api.bot.send.group('[RSS] 指令列表：\n查询 。rss list\n增加 。rss add\n删除 。rss del\n立即刷新 。rss update', e.group);
            }
        }
    ]
}