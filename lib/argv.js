'use strict'

const remoteProcess = require('electron').remote.process
const minimist = require('minimist')

const argv = minimist(remoteProcess.argv.slice(2))

module.exports = argv
