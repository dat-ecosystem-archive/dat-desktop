'use strict'

const { app, BrowserWindow, shell, Menu } = require('electron')
const { neutral } = require('dat-colors')
const autoUpdater = require('./lib/auto-updater')
const defaultMenu = require('electron-default-menu')
const doctor = require('dat-doctor')
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
    width: 800,
    height: 600,
    titleBarStyle: 'hidden-inset',
    minWidth: 640,
    minHeight: 395,
    backgroundColor: neutral
  })
  win.loadURL(`file://${__dirname}/index.html`)
  win.webContents.openDevTools()
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  if (process.env.NODE_ENV === 'production') {
    const log = str => win && win.webContents.send('log', str)
    autoUpdater({ log })
  }
})

app.on('will-finish-launching', () => {
  app.on('open-url', url => win.webContents.send('link', url))
})

app.on('window-all-closed', () => app.quit())

const quit = app.makeSingleInstance(() => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

if (quit) app.quit()
