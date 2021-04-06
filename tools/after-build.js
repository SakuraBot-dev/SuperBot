const path = require('path')
const fs = require('fs')

fs.readdirSync(path.join(__dirname, '../plugins')).forEach(e => {
  try {
    fs.mkdirSync(path.join(__dirname, '../dist/plugins', e))
  } catch (error) {}
  fs.copyFileSync(path.join(__dirname, '../plugins', e, 'superbot.config.json'), path.join(__dirname, '../dist/plugins', e, 'superbot.config.json'))
})
