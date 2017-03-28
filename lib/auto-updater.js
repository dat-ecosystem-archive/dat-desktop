const os = require('os')
const { app, dialog } = require('electron')
const { autoUpdater } = require('electron-auto-updater')
const ms = require('ms')

module.exports = ({ log }) => {
  const onerror = err => err && log(err.stack)

  const platform = `${os.platform()}_${os.arch()}`
  const version = app.getVersion()

  autoUpdater.setFeedURL(`http://dat.land:6000/update/${platform}/${version}`)
  autoUpdater.on('error', onerror)
  autoUpdater.on('checking-for-update', () => log('checking for update'))
  autoUpdater.on('update-available', () => log('update available, downloading…'))
  autoUpdater.on('update-not-available', () => log('update not available'))
  autoUpdater.on('download-progress', p => log('download progress ' + p.percent))
  autoUpdater.once('update-downloaded', (ev, notes, version) => {
    log('update downloaded')

    dialog.showMessageBox({
      type: 'question',
      buttons: ['Install and Relaunch', 'Dismiss'],
      defaultId: 0,
      title: 'A new version of Dat Desktop is ready to install!',
      message: `Dat Desktop ${version} has been downloaded and is ready to use! Would you like to install it and relaunch Dat Desktop now?`
    }, res => {
      const update = res === 0
      if (!update) return log('dismiss')
      log('updating…')
      autoUpdater.quitAndInstall()
    })
  })

  setTimeout(() => autoUpdater.checkForUpdates(), ms('10s'))
  setInterval(() => autoUpdater.checkForUpdates(), ms('30m'))
}
