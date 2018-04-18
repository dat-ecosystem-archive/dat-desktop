'use strict'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import datDesktopApp from './reducers'
import { addDat } from './actions'
import App from './components/app'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { ipcRenderer as ipc, remote } from 'electron'
import DatMiddleware from './actions/dat-middleware'
import minimist from 'minimist'
import path from 'path'
import { homedir } from 'os'

const argv = minimist(remote.process.argv.slice(2), {
  default: {
    db: path.join(homedir(), '.dat-desktop'),
    data: path.join(remote.app.getPath('downloads'), '/dat')
  }
})

const datMiddleware = new DatMiddleware({
  dataDir: argv.db,
  downloadsDir: argv.data
})

const store = createStore(
  datDesktopApp,
  compose(
    applyMiddleware(store => datMiddleware.middleware(store), thunk, logger)
  )
)

document.title = 'Dat Desktop | Welcome'

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('div')
)

datMiddleware.loadFromDisk()

ipc.on('log', (_, str) => console.log(str))
ipc.on('link', key => store.dispatch(addDat({ key })))
ipc.on('file', path => store.dispatch(addDat({ path })))
