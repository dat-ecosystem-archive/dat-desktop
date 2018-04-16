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
import { ipcRenderer as ipc } from 'electron'
import DatMiddleware from './actions/dat-middleware'

const datMiddleware = new DatMiddleware()

const store = createStore(
  datDesktopApp,
  compose(
    applyMiddleware(store => datMiddleware.middleware(store), thunk, logger)
  )
)

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
