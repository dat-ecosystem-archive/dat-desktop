const version = require('../package.json').version
const ipc = require('electron').ipcRenderer
const xhr = require('xhr')
const CrashModal = require('../elements/crash-modal')
const ErrorModal = require('../elements/error-modal')

module.exports = model

function model () {
  return {
    namespace: 'error',
    state: {
      message: null
    },
    subscriptions: {
      onUncaughtException: onUncaughtException
    },
    effects: {
      display: display,
      quit: quit
    }
  }
}

function display (state, error, send, done) {
  const message = error.message || error
  const modal = ErrorModal()(message)
  document.body.appendChild(modal)
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

    const modal = CrashModal()(() => {
      send('error:quit', done)
    })
    document.body.appendChild(modal)

    err._thrown = true
    throw err
  })
}

function quit (state, data, send, done) {
  ipc.sendSync('quit')
}
