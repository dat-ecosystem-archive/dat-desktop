const {app, process: remoteProcess} = require('electron').remote
const minimist = require('minimist')
const fs = require('fs')

module.exports = getRootDir

function getRootDir () {
  const argv = minimist(remoteProcess.argv.slice(2))
  const rootDir = argv.data || `${app.getPath('downloads')}/dat`
  return rootDir
}
