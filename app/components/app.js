'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import Header from './header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'

const App = () => (
  <Fragment>
    <Sprite />
    <Header />
    <TableContainer />
    <Dialog.LinkContainer />
    <Dialog.ConfirmContainer />
  </Fragment>
)

export default App