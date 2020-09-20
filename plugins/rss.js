const path = require('path');
const fs = require('fs');
const rss = require('rss-parser');
const admin = require('../lib/admin');
const api = require('../lib/api')
const dbDir = path.join(__dirname, '../db2');
const low = require('lowdb');

//json数据库
//const isCi = (process.argv.indexOf('ci') !== -1);
//if (isCi) return;
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir); //创建存放文件夹
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(dbDir, 'db2.json'));
const defaults = {
    rss: {}
}
const db2 = low(adapter);
const n = {};
const parser = new rss()
    //db._.mixin(lodashId);
db2.defaults(defaults).write();
let key = [];
let val = String("feed");
let obj = {};
obj[val] = key;
db2.read().get('rss').defaults(obj).write();
const update = async() => {
    api.logger.info(`RSS 开始更新订阅`);
    const r = await db2.read().get(`rss[feed]`).value();
    for (const _rss of r) {
        parser.parseURL(_rss.url).then(async rss_result => {
            try {
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
                s = `[RSS] 您订阅的 ${rss_result.title.trim()} 更新了\n`;
                let temp;
                for (i = 0; i < index; i++) { //确认要更新多少后，开始转发
                    //temp = /&lt;pre style=.*&gt;(.*)&lt;/.exec(rss_result.items[i].content.trim());
                    //console.log(rss_result.items[i]);
                    s = s + [
                        `标题${(i+1).toString()}：${rss_result.items[i].title.trim()}`,
                        `内容：${rss_result.items[i].contentSnippet.trim()}`,
                        `链接：${rss_result.items[i].link}`
                    ].join('\n') + "\n";
                }
                /*
                {
                    title: '',
                    link: '',
                    pubDate: '',
                    author: '',
                    content: '',
                    contentSnippet: '',
                    id: '',
                    isoDate: ''
                }
                */
                //console.log(groups.group);
                if (index > 0) { //有更新才转发
                    api.bot.socket.send.group(s, _rss.group);
                    db2.read().get(`rss[feed]`).find({
                        id: _rss.id
                    }).assign({
                        last_id: id
                    }).write();
                }
            } catch (e) {
                api.logger.warn(`RSS 更新错误, url: ${_rss.url}, err: ${e}`);
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
                helper: '.rss add [链接]	添加订阅',
                command: /^.rss add (.*)$/,
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
                        api.bot.socket.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
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
                                api.bot.socket.send.group('[RSS] 订阅成功', group);
                            } else {
                                api.bot.socket.send.group('[RSS] 该rss已订阅', group);
                            }
                        }).catch(e => {
                            api.bot.socket.send.group('[RSS] 订阅失败：' + e, group);
                        });
                    } else {
                        api.bot.socket.send.group('[RSS] 请填写正确的链接', group);
                    }
                }
            },
            {
                id: 'remove',
                helper: '.rss del [id]	删除订阅',
                command: /^.rss del (.*)$/,
                func: async(e) => {
                    const id = e.msg.substr(9);
                    const group = e.group;
                    //console.log(id);
                    if (!admin.isAdmin(e.sender.user_id)) {
                        api.bot.socket.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
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
                            api.bot.socket.send.group('[RSS] 删除成功', group);
                        } else {
                            api.bot.socket.send.group('[RSS] 该rss不存在，无法删除', group);
                        }
                    } catch (e) {
                        api.bot.socket.send.group('[RSS] 删除失败:' + e, group);
                    }
                }
            },
            {
                id: 'list',
                helper: '.rss list	查看本群订阅列表',
                command: /.rss list/,
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
                            api.bot.socket.send.group(s1, e.group);
                            //console.log(s1);
                        } else {
                            api.bot.socket.send.group('[RSS] 这个群还没有订阅任何内容', e.group);
                        }
                    } catch (e) {
                        api.bot.socket.send.group('[RSS] 查询失败：' + e, e.group);
                    }
                }
            },
            {
                id: 'update',
                helper: '.rss update	立刻刷新订阅',
                command: /.rss update/,
                func: async(e) => {
                    if (!admin.isAdmin(e.sender.user_id)) {
                        api.bot.socket.send.group('很抱歉，你不是机器人管理员，无权限操作！', e.group);
                        return;
                    }
                    await update();
                    api.bot.socket.send.group('[RSS] 刷新成功', e.group);
                }
            },
            {
                id: 'help',
                helper: '.rss help	rss帮助说明',
                command: /.rss help/,
                func: async(e) => {
                    api.bot.socket.send.group('[RSS] 指令列表：\n查询 .rss list\n增加 .rss add\n删除 .rss del\n立即刷新 .rss update', e.group);
                }
            }
        ]
    }
    /**
     nodejs本地存储轻量级数据库lowdb使用
     http://www.blogketori.com/wordpress/2020/03/28/nodejs%E6%9C%AC%E5%9C%B0%E5%AD%98%E5%82%A8%E8%BD%BB%E9%87%8F%E7%BA%A7%E6%95%B0%E6%8D%AE%E5%BA%93lowdb%E4%BD%BF%E7%94%A8/
    o zawa·2020-03-27·988 次阅读

    安装： npm install lowdb --save

    申请适配器初始化一个文件：

    const low = require('lowdb');
    const FileSync = require('lowdb/adapters/FileSync');
    const adapter = new FileSync('test.json'); // 申明一个适配器
    //注意，这里的test.json 相当于mysql中的database

    这里我初始化两张测试表，分别叫testTable1 testTable2

    db.defaults({'testTable1': []}).write();
    db.defaults({'testTable2': []}).write();
    这样数据库和表都创建完成了，现在我们要开始填入数据了（这里我理解的是数组代表一个表，如果有理解错请指正）

    await db.read().get('testTable1')
        .push({id: 1, name: 'testname', age:'60'})
        .write()
    这样就往testTable1表里插入了一条数据
    既然新增已经完毕了，接下来要做什么不要我多说了吧（当然是查询、修改和删除啦）

    查询：

    let data = await db.read().get('testTable1').find({name: testname}).value();
    查询名字为testname的值（注意，这里只能查询到一条数据,如果没查到则返回undefined）

    多值查询：

    db.read().get('testTable1').filter({name: 'test'}).value();
    返回一个数组，多值查询貌似还有个map方法，如果匹配上了的话数据是正确的，如果没有匹配上返回的数据长度异常（有点奇怪），之后换成了filter就能正确获得返回的数据

    查看表中的数据个数：

    db.get('testTable1').size().value(); // 返回该数组的长度为 1

    排序：

    db.get('testTable1')
      .filter({name: ''})
      .sortBy('age')
      .take(5)
      .value()
    根据年龄排序前五个
    设置值：

    db.read().set('testTable1', []) set也可以给对象设置一个值

    {testTable1:[
    {id: 1, name: 'testname', age:'60'}
    ],'sex':{man:'zhangsan'}
    }
    await db.read().set('sex.man', 'mazi') set当然也可以给对象设置一个值,修改后变成了
    {testTable1:[
    {id: 1, name: 'testname', age:'60'}
    ],'sex':{man:'mazi'}
    }

    修改：

    await db.read().get('testTable1').find({id: 1}).assign({name: test2}).write();
    把id为1用户的名字改为test

    删除：

    await db.read().get('testTable1')
      .remove({name: 'xxx'})
      .write();
    移除某个属性：

    await db.read().unset('testTable1[0].id').write();

    检查表是否存在：

    await db.read().has('testTable1')
      .value()
    修改方法（？）：

    await db.read().update('count', n => n + 1)
      .write() 此方法没用过，官方文档上说是用来增量的
    返回数据库信息：await db.read().getState()

    替换数据库信息：const jsonState = {} db.setState(jsonState) //把数据库设置为空

    自定义函数：

    await db.read()._.mixin({
        second: function(array){  //array参数为testTable表中所有数据
            return array[1]  //返回表中的第一条数据
        }
    })

    let r=db.get('testTable').second().value() 
    console.log(r)

    后续===>

    1、调用方法的时候一定要加.read()这样是读取源文件，如果不加read()方法的话会出现奇奇怪怪的情况，比如为用一个schdeul来跑任务循环给json里面添加文件，你会发现json里面确实有新的值和属性，但是其他进程无论如何就是读不到数据，必须重启应用才行。

    2、db.read().xx方法返回的是prmoise对象（正常来说），但是有种情况就是把db.read().xx方法写到了try catch的catch里面，就会报错，提示返回的不是一个promise，官网文档上确实说过，可能会返回promise，所以在catch里面直接使用db.read().xxx即可

    3、lowdb是基于lodash的，所以支持lodash的api，就比如set这个方法就是用的lodash的api，你甚至可以用简写语法例如_.get和_.find来使用，也就是db.get()、db.find()

    以上只是官方文档的一部分，如果没有特别复杂的业务应该是够用了，如果不够用就去官方文档看吧，文档地址：https://github.com/typicode/lowdb

     */