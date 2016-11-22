const defaultMenu = require('electron-default-menu')
const { app, shell, Menu } = require('electron')
const window = require('electron-window')
const Env = require('envobj')
const path = require('path')

const delegateEvents = require('./lib/delegate-electron-events')

const windowStyles = {
  width: 1000,
  titleBarStyle: 'hidden-inset'
}

const env = Env({ NODE_ENV: 'production' })
const emitter = delegateEvents() // make sure we don't miss events while booting

app.on('ready', () => {
  const mainWindow = window.createWindow(windowStyles)
  const indexPath = path.join(__dirname, 'index.html')

  emitter.on('open-file', (file) => mainWindow.webContents.send('file', file))
  emitter.on('open-url', (url) => mainWindow.webContents.send('link', url))

  mainWindow.showUrl(indexPath, () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))
    if (env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })
})
