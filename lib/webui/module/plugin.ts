import { plugins } from '../../core/plugin';

export const pluginList = () => {
  const p: any[] = [];
  Object.keys(plugins).forEach(packagename => {
    p.push({
      packagename: packagename,
      status: plugins[packagename].in ? true : false,
      name: plugins[packagename].package.name,
      path: plugins[packagename].root,
      config: plugins[packagename].config
    });
  })
  return p;
}

export const loadPlugin = (packagename: string) => {
  if(plugins[packagename]){
    if(plugins[packagename].in){
      return '插件已经加载了';
    }else{
      plugins[packagename].load();
      return '加载成功';
    }
  }else{
    return '插件未找到'
  }
}

export const unloadPlugin = async (packagename: string) => {
  if(plugins[packagename]){
    if(!plugins[packagename].in){
      return '插件未加载';
    }else{
      await plugins[packagename].unload();
      return '卸载成功';
    }
  }else{
    return '插件未找到'
  }
}