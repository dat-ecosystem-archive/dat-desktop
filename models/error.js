const ipc = require('electron').ipcRenderer
const xhr = require('xhr')
const version = require('../package.json').version
const Modal = require('../elements/modal')

module.exports = errorModel

function errorModel (state, bus) {
  bus.on('error', function (err) {
    const message = err.message || err
    const modal = Modal.error()(message)
    document.body.appendChild(modal)
  })

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

    const modal = Modal.crash()(function () {
      ipc.sendSync('quit')
    })
    document.body.appendChild(modal)

    err._thrown = true
    throw err
  })
}
