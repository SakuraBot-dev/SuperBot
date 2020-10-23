import fs from 'fs';
import path from 'path';
import config from '../../config';

export default {
  /**
   * @description 是否为群组内管理员
   * @param user_id QQ号
   * @param group_id 群号
   */
  isGroupAdmin: (user_id: number, group_id: number) => {
    const dir = path.join(__dirname, `../../data/admin/group/${group_id}.json`);

    if(config.bot.owner === user_id) return true;
    if(!fs.existsSync(dir)) return false;

    const adminList = JSON.parse(fs.readFileSync(dir).toString());
    return [...adminList].indexOf(user_id) !== -1;
  },
  /**
   * @description 是否为全局管理员
   * @param user_id QQ号
   */
  isGlobalAdmin: (user_id: number) => {
    const dir = path.join(__dirname, `../../data/admin/global.json`);

    if(config.bot.owner === user_id) return true;
    if(!fs.existsSync(dir)) return false;

    const adminList = JSON.parse(fs.readFileSync(dir).toString());
    return [...adminList].indexOf(user_id) !== -1;
  },
  /**
   * @description 是否为机器人主人
   * @param user_id QQ号
   */
  isOwner: (user_id: number) => {
    return config.bot.owner === user_id;
  },
  /**
   * @description 添加全局管理员
   * @param user_id QQ号
   */
  addGlobalAdmin: (user_id: number) => {
    try{
      let adminList = [];
      
      const dir = path.join(__dirname, `../../data/admin/global.json`);
      
      if(fs.existsSync(dir)) adminList = JSON.parse(fs.readFileSync(dir).toString());
      
      [...adminList].push(user_id);
      fs.writeFileSync(dir, JSON.stringify(adminList));
      return true;
    }catch(e){
      return false;
    }
  },
  /**
   * @description 删除全局管理员
   * @param user_id QQ号
   */
  delGlobalAdmin: (user_id: number) => {
    try{
      let adminList = [];
      
      const dir = path.join(__dirname, `../../data/admin/global.json`);
      
      if(fs.existsSync(dir)) adminList = JSON.parse(fs.readFileSync(dir).toString());
      
      [...adminList].filter(e => {
        if(e !== user_id) return e;
      });
      
      fs.writeFileSync(dir, JSON.stringify(adminList));
      return true;
    }catch(e){
      return false;
    }
  },
  /**
   * @description 添加群组管理员
   * @param user_id QQ号
   * @param group_id 群号
   */
  addGroupAdmin: (user_id: number, group_id: number) => {
    try{
      let adminList = [];

      const dir = path.join(__dirname, `../../data/admin/group/${group_id}.json`);
      
      if(fs.existsSync(dir)) adminList = JSON.parse(fs.readFileSync(dir).toString());
      
      adminList.push(user_id);
      fs.writeFileSync(dir, JSON.stringify(adminList));
      return true;
    }catch(e){
      return false;
    }
  },
  /**
   * @description 删除群组管理员
   * @param user_id QQ号
   * @param group_id 群号
   */
  delGroupAdmin: (user_id: number, group_id: number) => {
    try{
      let adminList = [];

      const dir = path.join(__dirname, `../../data/admin/group/${group_id}.json`);
      
      if(fs.existsSync(dir)) adminList = JSON.parse(fs.readFileSync(dir).toString());
      
      [...adminList].filter(e => {
        if(e !== user_id) return e;
      });
      
      fs.writeFileSync(dir, JSON.stringify(adminList));
      return true;
    }catch(e){
      return false;
    }
  }
}