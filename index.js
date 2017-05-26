const defaultMenu = require('electron-default-menu')
const { app, shell, Menu, ipcMain } = require('electron')
const window = require('electron-window')
const Env = require('envobj')
const path = require('path')
const doctor = require('dat-doctor')
const Writable = require('stream').Writable

const autoUpdater = require('./lib/auto-updater')
const colors = require('dat-colors')

const delegateEvents = require('delegate-electron-events')

const windowStyles = {
  width: 800,
  height: 600,
  titleBarStyle: 'hidden-inset',
  minWidth: 640,
  minHeight: 395,
  backgroundColor: colors.neutral
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
    mainWindow.webContents.openDevTools({ mode: 'detach' })
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
  ipcMain.on('progress', (ev, progress) => mainWindow.setProgressBar(progress))
  emitter.on('open-file', (file) => mainWindow.webContents.send('file', file))
  emitter.on('open-url', (url) => mainWindow.webContents.send('link', url))

  mainWindow.showUrl(indexPath, () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    if (env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
    if (env.NODE_ENV === 'production') {
      autoUpdater({ log })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  if (env.NODE_ENV !== 'production') {
    const browserify = require('./lib/browserify')
    const b = browserify({ watch: true })
    b.once('written', onReady)
  } else {
    onReady()
  }
})

app.on('window-all-closed', () => app.quit())
