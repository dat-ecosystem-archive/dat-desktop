'use strict'

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron')
const { neutral } = require('dat-colors')
const autoUpdater = require('./lib/auto-updater')
const defaultMenu = require('electron-default-menu')
const doctor = require('dat-doctor')
const isDev = process.env.NODE_ENV !== 'production'
const { Writable } = require('stream')

const menu = defaultMenu(app, shell)
menu[menu.length - 1].submenu.push({
  label: 'Doctor',
  click: () => {
    win.webContents.openDevTools({ mode: 'detach' })
    const out = Writable({
      write (chunk, env, done) {
        if (win) win.webContents.send('log', chunk.toString())
        done()
      }
    })
    doctor({ out })
  }
})

let win

app.on('ready', () => {
  win = new BrowserWindow({
    // Extending the size of the browserwindow to make sure that the developer bar is visible.
    width: 800 + (isDev ? 50 : 0),
    height: 600 + (isDev ? 200 : 0),
    titleBarStyle: 'hiddenInset',
    minWidth: 640,
    minHeight: 395,
    backgroundColor: neutral,
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    }
  })
  win.loadURL(`file://${__dirname}/index.html`)
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  ipcMain.on('progress', (_, progress) => win && win.setProgressBar(progress))

  if (isDev) {
    win.webContents.openDevTools()
  } else {
    const log = str => win && win.webContents.send('log', str)
    autoUpdater({ log })
  }
})

app.on('will-finish-launching', () => {
  app.on('open-url', (_, url) => win.webContents.send('link', url))
  app.on('open-file', (_, path) => win.webContents.send('file', path))
})

app.on('window-all-closed', () => app.quit())

const quit = app.makeSingleInstance(() => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

if (quit) app.quit()
