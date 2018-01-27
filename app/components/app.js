'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import Header from './header'
import TableContainer from '../containers/table'
import LinkContainer from '../containers/dialog'

const App = () => (
  <Fragment>
    <Sprite />
    <Header />
    <TableContainer />
    <LinkContainer />
  </Fragment>
)

export default App