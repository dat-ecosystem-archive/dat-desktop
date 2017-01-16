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
    const data = {
      search: { error: true }
    }

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
    console.error(err.stack)
    send('location:set', data, done)
  })
}

function quit (state, data, send, done) {
  ipc.sendSync('quit')
}
