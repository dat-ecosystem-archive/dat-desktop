const EventEmitter = require('events').EventEmitter
const { app, ipcMain } = require('electron')

module.exports = delegateElectronEvents

// delegate electron events while booting
// until a window is ready that can handle them
function delegateElectronEvents () {
  var file = null
  var link = null
  var win = null

  app.on('will-finish-launching', () => {
    app.on('open-file', (ev, path) => {
      ev.preventDefault()
      if (win) ee.emit('open-file', path)
      else file = path
    })

    app.on('open-url', (ev, url) => {
      ev.preventDefault()
      if (win) ee.emit('open-url', url)
      else link = url
    })
  })

  const ee = new EventEmitter()

  ipcMain.on('ready', () => {
    if (file) {
      let path = file
      file = null
      ee.emit('open-file', path)
    }
    if (link) {
      let url = link
      link = null
      ee.emit('open-url', url)
    }
  })

  return ee
}
