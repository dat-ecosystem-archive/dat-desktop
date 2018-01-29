'use strict'

const { app, BrowserWindow } = require('electron')
const { neutral } = require('dat-colors')

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
})

app.on('window-all-closed', () => app.quit())

const quit = app.makeSingleInstance(() => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

if (quit) app.quit()
