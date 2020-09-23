const gcStat = require("gc-stats");
const logger = require('./logger').main;
const stats = gcStat();

const gcLog = [];
const gcInfo = {
  num: 0,
  force: 0
}

stats.on("stats", (e) => {
  logger.debug(`GC pause: ${e.pauseMS}, type: ${e.gctype}`)

  gcLog.push({
    pause: e.pauseMS,
    diff: e.diff,
    time: new Date(),
    type: e.gctype
  });

  if(gcLog.length > 10){
    gcLog.shift();
  }

  gcInfo.num++;
});

module.exports.gcInfo = gcInfo;
module.exports.gcLog = gcLog;

module.exports.gc = () => {
  try {
    global.gc();
    gcInfo.force++;
    gcInfo.num--;
    return true;
  } catch (error) {
    return false;
  }
}