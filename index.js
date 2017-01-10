const defaultMenu = require('electron-default-menu')
const { app, shell, Menu, ipcMain, dialog } = require('electron')
const window = require('electron-window')
const Env = require('envobj')
const path = require('path')
const doctor = require('dat-doctor')
const { Writable } = require('stream')
const { autoUpdater } = require('electron-auto-updater')
const os = require('os')
const fs = require('fs')

const delegateEvents = require('./lib/delegate-electron-events')

const windowStyles = {
  width: 800,
  height: 600,
  titleBarStyle: 'hidden-inset',
  minWidth: 640
}

const env = Env({ NODE_ENV: 'production' })
const emitter = delegateEvents() // make sure we don't miss events while booting
let mainWindow

const menu = defaultMenu(app, shell)
menu[menu.length - 1].submenu.push({
  label: 'Doctor',
  click: () => {
    const out = Writable({
      write (chunk, env, done) {
        if (mainWindow) mainWindow.webContents.send('log', chunk.toString())
        done()
      }
    })
    doctor({ out })
  }
})

app.on('ready', () => {
  mainWindow = window.createWindow(windowStyles)
  const indexPath = path.join(__dirname, 'index.html')

  ipcMain.on('quit', () => app.quit()) // TODO: ping backend with error
  emitter.on('open-file', (file) => mainWindow.webContents.send('file', file))
  emitter.on('open-url', (url) => mainWindow.webContents.send('link', url))

  mainWindow.showUrl(indexPath, () => {
    menu[0].submenu.splice(1, 0, {
      label: 'Check for Updates...',
      click: () => {}
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    if (env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
      const skipFile = `${app.getPath('userData')}/skip`
      const platform = `${os.platform()}_${os.arch()}`
      const version = app.getVersion()
      const log = str => mainWindow.webContents.send('log', str)

      autoUpdater.setFeedURL(`http://dat.land:6000/update/${platform}/${version}`)
      autoUpdater.on('error', err => log(err.stack))
      autoUpdater.on('checking-for-update', () => log('checking for update'))
      autoUpdater.on('update-available', () => log('update available'))
      autoUpdater.on('update-not-available', () => log('update not available'))
      autoUpdater.on('download-progress', p => log('download progress ' + p.percent))
      autoUpdater.on('update-downloaded', (ev, notes, version) => {
        log('update downloaded')
        fs.readFile(skipFile, { encoding: 'utf8' }, (err, skipVersion) => {
          if (version === skipVersion) return log('skip update')

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
              autoUpdater.quitAndInstall()
            } else {
              log('skip update')
              fs.writeFile(skipFile, version, err => {
                if (err) throw err
              })
            }
          })
        })
      })
      autoUpdater.checkForUpdates()
    }
  })
})
