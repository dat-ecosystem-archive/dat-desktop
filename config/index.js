const path = require('path')
const fs = require('fs')

module.exports = function (argv) {
  const env = argv.env || 'dev'
  var config
  try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, `env_${env}.json`)).toString())
  } catch (err) {
    console.error('Config file is unreadable.')
    console.trace(err)
  }
  return config
}
