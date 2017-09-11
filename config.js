const fs = require('fs')
const mkdirp = require('mkdirp')
const cache = require('memory-cache')
const path = require('path')

const CONFIG_PATHS = [
  '~/.config/filing/config.json',
  `${process.cwd()}/config.example.json`
]

function parseConfiguration() {
  let config = cache.get('config')

  if (config) {
    return config
  }

  try {
    config = fs.readFileSync(require('first-existing-path').sync(CONFIG_PATHS)).toString().replace(/\s*\/\/.+$/gm, '')
  } catch(e) {
    console.error('No configuration file found in the following paths:\n', CONFIG_PATHS.join('\n'))
    process.exit(1)
  }

  try {
    config = JSON.parse(config)
  } catch (e) {
    console.error('Configuration is not valid JSON:', config)
    process.exit(1)
  }

  try {
    mkdirp(config.metadata)
  } catch (e) {}

  config.list = path.join(config.metadata, config.list)

  const dirList = path.dirname(config.list)

  if (dirList === config.metadata) {
    console.error('The list database must be in a subdirectory (data/list.json).', config)
    process.exit(1)
  }

  try {
    mkdirp(dirList)
  } catch (e) {}

  config.dirList = dirList

  config.socket = path.join(config.metadata, config.socket)

  config.downloadsDir = config.downloadsDir ? config.downloadsDir : path.join('./downloads', '/dat')

  cache.put(config)

  return config
}

module.exports = parseConfiguration
