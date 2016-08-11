const {app, BrowserWindow, ipcMain} = require('electron')

let win, file, link

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

function createWindow () {
  win = new BrowserWindow()
  win.loadURL(`file://${__dirname}/index.html`)
  win.webContents.openDevTools()
  win.on('closed', () => { win = null })
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (!win) createWindow()
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
