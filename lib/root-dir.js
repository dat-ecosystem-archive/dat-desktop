const {app, process: remoteProcess} = require('electron').remote
const minimist = require('minimist')
const fs = require('fs')

const argv = minimist(remoteProcess.argv.slice(2))
const rootDir = argv.data || `${app.getPath('downloads')}/dat`
try { fs.mkdirSync(rootDir) } catch (_) {}
module.exports = rootDir
