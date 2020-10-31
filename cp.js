const fs = require('fs');
fs.readdirSync('./plugins').forEach(e => {
  fs.copyFileSync(`./plugins/${e}/package.json`, `./dist/plugins/${e}/package.json`);
})