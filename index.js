const defaultMenu = require('electron-default-menu')
const { app, shell, Menu, ipcMain } = require('electron')
const window = require('electron-window')
const Env = require('envobj')
const path = require('path')
const doctor = require('dat-doctor')
const { Writable } = require('stream')
const autoUpdater = require('./lib/auto-updater')

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

const shouldQuit = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

if (shouldQuit) app.quit()

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

function onReady () {
  mainWindow = window.createWindow(windowStyles)
  const indexPath = path.join(__dirname, 'index.html')
  const log = str => mainWindow.webContents.send('log', str)

  ipcMain.on('quit', () => app.quit()) // TODO: ping backend with error
  emitter.on('open-file', (file) => mainWindow.webContents.send('file', file))
  emitter.on('open-url', (url) => mainWindow.webContents.send('link', url))

  mainWindow.showUrl(indexPath, () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    if (env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    } else {
      autoUpdater({ log })
    }
  })
}

app.on('ready', () => {
  if (env.NODE_ENV === 'development') {
    const browserify = require('./lib/browserify')
    const b = browserify({ watch: true })
    b.once('bundle', onReady)
  } else {
    onReady()
  }
})
