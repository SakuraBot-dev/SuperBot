interface timer {
  [key: string]: any;
  [index: number]: Array<number>;
}

const timer: timer = {};

const addTimer = (plugin: string, func: any, time: number) => {
  if(!timer[plugin]) timer[plugin] = [];
  timer[plugin].push(setInterval(func, time));
}

const removeTimer = (plugin: string) => {
  if(!timer[plugin]) return true;
  timer[plugin].forEach((e:number) => {
    clearInterval(e);
  });
  delete timer[plugin];
}

export default {
  addTimer,
  removeTimer
};