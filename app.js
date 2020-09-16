const fs = require('fs');
const plugin = require('./plugin');
/*const {
    exit
} = require('process');*/
/*const db2 = require('./lib/db2');

let id = parseInt(new Date().getTime() / 1000);
db2.read().get(`rss[feed]`)
    .push({
        id: id,
        url: "link2",
        group: "group",
        user: "sender",
        status: "enable"
    })
    .write();
console.log("2333");
let data = db2.read().get(`rss[feed]`).find({ url: 'link3' }).value();
console.log(data)
process.exit()*/
try {
    fs.mkdirSync('./data');
} catch (e) {}

// 开始加载插件
plugin();