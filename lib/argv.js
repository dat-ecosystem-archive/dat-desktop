'use strict'

const remoteProcess = require('electron').remote.process
const minimist = require('minimist')

const argv = minimist(remoteProcess.argv.slice(2), {
  alias: {
    up: ['upload', 'throttle-upload'],
    down: ['download', 'throttle-download']
  }
})

module.exports = argv
