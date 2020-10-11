const api = require('../lib/api');
const request = require('request');

const search = (keyword) => {
	return new Promise(r => {
		request(`https://api-pub.imoe.xyz/v1/pixiv/search?keyword=${keyword}`, (err, res, body) => {
			if(!err && res.statusCode === 200){
				const data = JSON.parse(body);
				const max = Object.keys(data.illusts).length - 1;
				const illust = data.illusts[api.utils.random(0, max)];
				r(illust);
			}else{
				r(null)
			}
		})
	})
};

const getImg = (id) => {
	return new Promise(r => {
		const urls = [];
		request(`https://api-pub.imoe.xyz/v1/pixiv/illust?id=${id}`, (err, res, body) => {
			if(!err && res.statusCode === 200){
				const data = JSON.parse(body);

				if(data.illust.meta_pages.length === 0){
					// 单图
					urls.push(data.illust.image_urls.medium.replace('i.pximg.net', 'i.pixiv.cat'));
				}else{
					// 多图
					Object.keys(data.illust.meta_pages).forEach(i => {
						const t = data.illust.meta_pages[i];
						urls.push(t.image_urls.medium.replace('i.pximg.net', 'i.pixiv.cat'));
					});
				}

				r(urls);
			}else{
				r(null)
			}
		})
	})
}

const isR18 = (tags) => {
	let r18 = false;
	Object.keys(tags).forEach(e => {
		if(tags[e].name === 'R-18' || tags[e].name === 'R18' || tags[e].name === 'R-18G' || tags[e].name === 'R18-G' || tags[e].name === 'R-18-G'){
			r18 = true;
		}
	});
	return r18;
}

module.exports = {
	plugin: {
		name: 'Pixiv',
		desc: 'P站搜图',
		version: '0.0.1',
		author: '涂山苏苏'
	},
	events: {
		// 加载
		onload: () => {
			api.logger.info('Pixiv 开始运行')
		},
		// 卸载
		onunload: () => {
			api.logger.info('Pixiv 停止始运行')
		}
	},
	commands: [
		{
			id: 'pixiv',
			helper: '.pixiv [keyword|id] P站搜图',
			command: /^\.pixiv (.*)$/,
			func: async (e) => {
				const keyword = e.msg.substr(7);

				await api.bot.http.send.group('Searching...', e.group)

				if(api.utils.isNumber(keyword)){
					const urls = await getImg(keyword);
					const msg = [];
					urls.forEach(url => {
						msg.push(`[CQ:cardimage,file=${url}]`);
					})
					await api.bot.http.send.group(msg, e.group);
				}else{
					const r = await search(keyword);
					if(!r || isR18(r.tags)){
						await api.bot.http.send.group(`没有搜索到任何结果`, e.group);
					}else{
						const urls = await getImg(r.id);
						const msg = [];
						urls.forEach(url => {
							msg.push(`[CQ:cardimage,file=${url}]`);
						})
						await api.bot.http.send.group(msg, e.group);
					}
				}
			}
		}
	]
}