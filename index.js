const {app, BrowserWindow, ipcMain, Menu, shell} = require('electron')
const defaultMenu = require('electron-default-menu')

const env = process.env.NODE_ENV

let win, file, link

// handle electron events
ipcMain.on('ready', () => {
  if (file) {
    let path = file
    file = null
    win.webContents.send('file', path)
  }
  if (link) {
    let url = link
    link = null
    win.webContents.send('link', url)
  }
})

// create the HTML window inside the electron client
// null -> null
function createWindow () {
  win = new BrowserWindow({ width: 1000, titleBarStyle: 'hidden-inset' })

  // TODO(yw): move the HTML file to a separate package
  win.loadURL(`file://${__dirname}/index.html`)
  if (env === 'development') {
    win.webContents.openDevTools({
      mode: 'detach'
    })
  }
  win.on('closed', () => { win = null })

  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))
}

app.on('ready', () => {
  app.ready = true
  createWindow()
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (!win && app.ready) createWindow()
})
app.on('will-finish-launching', () => {
  app.on('open-file', (ev, path) => {
    ev.preventDefault()
    if (win) win.webContents.send('file', path)
    else file = path
  })
  app.on('open-url', (ev, url) => {
    ev.preventDefault()
    if (win) win.webContents.send('link', url)
    else link = url
  })
})
