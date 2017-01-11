const defaultMenu = require('electron-default-menu')
const { app, shell, Menu, ipcMain } = require('electron')
const window = require('electron-window')
const Env = require('envobj')
const path = require('path')
const doctor = require('dat-doctor')
const { Writable } = require('stream')
const { autoUpdater } = require('electron-auto-updater')

const updates = require('./lib/updates')
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
  const log = str => mainWindow.webContents.send('log', str)

  ipcMain.on('quit', () => app.quit()) // TODO: ping backend with error
  emitter.on('open-file', (file) => mainWindow.webContents.send('file', file))
  emitter.on('open-url', (url) => mainWindow.webContents.send('link', url))

  mainWindow.showUrl(indexPath, () => {
    menu[0].submenu.splice(1, 0, {
      label: 'Check for Updates...',
      click: () => {
        updates.check(mainWindow, log, (err, version) => {
          if (err) return
          updates.ask(mainWindow, version, log, (err, update) => {
            if (err) throw err
            if (update) autoUpdater.quitAndInstall()
          })
        })
      }
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    if (env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
      updates.check(mainWindow, log, (err, version) => {
        if (err || !version) return

        updates.maybeSkip(version, log, (err, skip) => {
          if (err) throw err
          if (skip) return

          updates.ask(mainWindow, version, log, (err, update) => {
            if (err) throw err
            if (update) {
              autoUpdater.quitAndInstall()
            } else {
              updates.setSkip(version, err => {
                if (err) throw err
              })
            }
          })
        })
      })
    }
  })
})
