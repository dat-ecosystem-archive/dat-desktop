'use strict'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import datDesktopApp from './reducers'
import App from './components/app'
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import { ipcRenderer as ipc } from 'electron'
import { loadFromDisk } from './actions'

const store = createStore(
  datDesktopApp,
  compose(applyMiddleware(thunk, logger))
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('div')
)

store.dispatch(loadFromDisk())

ipc.on('log', (_, str) => console.log(str))
