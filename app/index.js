'use strict'

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import redatApp from './reducers'
import App from './components/app'
import logger from 'redux-logger'
// import persistState from 'redux-localstorage'
import thunk from 'redux-thunk'

const store = createStore(
  redatApp,
  compose(/* persistState(), */ applyMiddleware(thunk, logger))
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('div')
)
