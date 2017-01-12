const ipc = require('electron').ipcRenderer

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
    var data = {
      search: { error: true }
    }
    console.error(err.stack)
    send('location:set', data, done)
  })
}

function quit (state, data, send, done) {
  ipc.sendSync('quit')
}
