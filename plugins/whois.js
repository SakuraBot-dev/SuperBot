const request = require('request');
const api = require('../lib/api');
const config = require('../config');

module.exports = {
    plugin: {
        name: 'Whois',
        desc: '查询IP和域名的whois信息',
        version: '0.0.3',
        author: '涂山苏苏'
    },
    events: {
        // 加载
        onload: (e) => {
            api.logger.info(`Whois 开始运行`);
        },
        // 卸载
        onunload: (e) => {
            api.logger.info(`Whois 停止运行`);
        }
    },
    commands: [{
            id: 'ip',
            helper: '.whois ip [IP] 查询IP的whois数据',
            command: /\.whois\ ip\ (.*)/,
            func: async(e) => {
                const ip = e.msg.substr(10);
                api.bot.socket.send.group('正在查询', e.group);
                request(`https://open.imoe.xyz/prod/whois/ip/${ip}`, {}, (err, res, body) => {
                    if (res.statusCode === 200 || !err) {
                        try {
                            const info = JSON.parse(body);
                            if (!info.success) {
                                api.bot.socket.send.group('查询失败', e.group);
                            } else {
                                const country = info.country; // 国家
                                const region = info.region; // 省份
                                const city = info.city; // 城市
                                const type = info.type; // 类型
                                const asn = info.asn; // ASN
                                const org = info.org; // 所属组织
                                const isp = info.isp; // 运营商

                                api.bot.socket.send.group([
                                    `IP: ${ip}`,
                                    `类型: ${type}`,
                                    `国家: ${country}`,
                                    `省份: ${region}`,
                                    `城市: ${city}`,
                                    `ASN: ${asn}`,
                                    `组织: ${org}`,
                                    `运营商: ${isp}`
                                ].join('\n'), e.group);
                            }
                        } catch (e) {
                            api.bot.socket.send.group('查询失败', e.group);
                        }
                    } else {
                        api.bot.socket.send.group('查询失败', e.group);
                    }
                });
            }
        },
        {
            id: 'domain',
            helper: '.whois domain [域名] 查询域名的whois数据',
            command: /\.whois\ domain\ (.*)/,
            func: async(e) => {
                const domain = e.msg.substr(14);
                api.bot.socket.send.group('正在查询...', e.group);
                request(`https://api.devopsclub.cn/api/whoisquery?domain=${domain}&token=${config.plugin.whois.token}`, {}, (err, res, body) => {
                    if (res.statusCode === 200 || !err) {
                        try {
                            const info = JSON.parse(body);
                            if (info.code !== 0) {
                                api.bot.socket.send.group('查询失败', e.group);
                            } else {
                                const sponsoringRegistrar = info.data.data.sponsoringRegistrar;
                                const registrationTime = info.data.data.registrationTime;
                                const registrantContactEmail = info.data.data.registrantContactEmail;
                                const registrant = info.data.data.registrant;
                                const nameServer = info.data.data.nameServer.join(', ');
                                const expirationTime = info.data.data.expirationTime;
                                const domainStatus = info.data.data.domainStatus;

                                api.bot.socket.send.group([
                                    `域名: ${domain}`,
                                    `注册商: ${sponsoringRegistrar}`,
                                    `域名状态: ${domainStatus}`,
                                    `注册时间: ${registrationTime}`,
                                    `过期时间: ${expirationTime}`,
                                    `注册人: ${registrant}`,
                                    `邮箱: ${registrantContactEmail}`,
                                    `NS服务器: ${nameServer}`,
                                ].join('\n'), e.group);
                            }
                        } catch (e) {
                            api.bot.socket.send.group('查询失败', e.group);
                        }
                    } else {
                        api.bot.socket.send.group('查询失败', e.group);
                    }
                });
            }
        },
        {
            id: 'icp',
            helper: '.icp [域名] 查询域名备案信息',
            command: /^\.icp\ (.*)$/,
            func: async(e) => {
                const domain = e.msg.substr(4);

                api.bot.socket.send.group('正在查询', e.group);
                request(`https://api.devopsclub.cn/api/icpquery?url=${domain}&token=${config.plugin.whois.token}`, {}, (err, res, body) => {
                    if (res.statusCode === 200 || !err) {
                        try {
                            const info = JSON.parse(body);
                            if (info.code !== 0) {
                                if (info.msg === 'icp information does not exist') {
                                    api.bot.socket.send.group('未找到备案信息', e.group);
                                } else {
                                    api.bot.socket.send.group('查询失败', e.group);
                                }
                            } else {
                                const name = info.data.organizer_name.trim(); // 组织名/姓名
                                const type = info.data.organizer_nature.trim(); // 备案类型
                                const icpn = info.data.recording_license_number.trim(); // 备案号
                                const index = info.data.site_index_url.trim(); // 首页链接
                                const siteName = info.data.site_name.trim(); // 站点名称
                                const time = info.data.review_time.trim(); // 审查日期
                                api.bot.socket.send.group([
                                    `组织名/姓名: ${name}`,
                                    `类型: ${type}`,
                                    `备案号: ${icpn}`,
                                    `首页链接: ${index}`,
                                    `网站名称: ${siteName}`,
                                    `审查日期: ${time}`
                                ].join('\n'), e.group);
                            }
                        } catch (e) {
                            api.bot.socket.send.group('查询失败', e.group);
                        }
                    } else {
                        api.bot.socket.send.group('查询失败', e.group);
                    }
                });
            }
        },
    ]
}