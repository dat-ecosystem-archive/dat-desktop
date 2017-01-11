const once = require('once')
const os = require('os')
const { app, dialog } = require('electron')
const { autoUpdater } = require('electron-auto-updater')
const fs = require('fs')

const skipFile = `${app.getPath('userData')}/skip`

exports.check = (mainWindow, log, cb) => {
  cb = once(cb)
  const platform = `${os.platform()}_${os.arch()}`
  const version = app.getVersion()

  autoUpdater.setFeedURL(`http://dat.land:6000/update/${platform}/${version}`)
  autoUpdater.on('error', err => {
    log(err.stack)
    cb(err)
  })
  autoUpdater.on('checking-for-update', () => log('checking for update'))
  autoUpdater.on('update-available', () => log('update available, downloading...'))
  autoUpdater.on('update-not-available', () => log('update not available'))
  autoUpdater.on('download-progress', p => log('download progress ' + p.percent))
  autoUpdater.on('update-downloaded', (ev, notes, version) => {
    log('update downloaded')
    cb(null, version)
  })
  autoUpdater.checkForUpdates()
}

exports.ask = (mainWindow, version, log, cb) => {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Install and Relaunch', 'Skip Update'],
    defaultId: 0,
    title: 'A new version of Dat Desktop is ready to install!',
    message: `Dat Desktop ${version} has been downloaded and is ready to use! Would you like to install it and relaunch Dat Desktop now?`
  }, res => {
    const update = res === 0
    if (update) {
      log('updating...')
      cb(null, true)
    } else {
      log('skip update')
      cb(null, false)
    }
  })
}

exports.maybeSkip = (version, log, cb) => {
  fs.readFile(skipFile, { encoding: 'utf8' }, (err, skipVersion) => {
    if (err && err.code !== 'enoent') return cb(err)
    if (version === skipVersion) {
      log('skip update')
      return cb(null, true)
    }
  })
}

exports.setSkip = (version, cb) => fs.writeFile(skipFile, version, cb)
