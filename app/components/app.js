'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import Header from './header'
import TableContainer from '../containers/table'
import LinkContainer from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'

const App = () => (
  <Fragment>
    <Sprite />
    <Header />
    <TableContainer />
    <StatusBarContainer />
    <LinkContainer />
  </Fragment>
)

export default App