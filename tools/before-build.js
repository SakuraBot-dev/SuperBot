const fs = require('fs')
const path = require('path')

try {
  const plugins = path.join(__dirname, '../dist/plugins')
  if (fs.existsSync(plugins)) {
    fs.readdirSync(plugins).forEach(file => {
      fs.unlinkSync(path.join(plugins, file))
    })
  }
} catch (error) {

}
