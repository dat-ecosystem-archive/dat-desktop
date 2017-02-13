const version = require('../package.json').version
const ipc = require('electron').ipcRenderer
const xhr = require('xhr')

module.exports = model

function model () {
  return {
    namespace: 'error',
    subscriptions: {
      onUncaughtException: onUncaughtException
    },
    effects: {
      quit: quit
    }
  }
}

function onUncaughtException (send, done) {
  process.on('uncaughtException', function (err) {
    if (err._thrown) return

    const opts = {
      uri: 'https://crash-reporter.dat.land/report',
      method: 'PUT',
      json: {
        version: version,
        timestamp: new Date(),
        error: JSON.stringify({
          name: err.name,
          stack: err.stack,
          message: err.message
        })
      }
    }
    xhr(opts, function (err) {
      if (err) console.error(err)
    })
    send('location:set', '?error=true', done)

    err._thrown = true
    throw err
  })
}

function quit (state, data, send, done) {
  ipc.sendSync('quit')
}
