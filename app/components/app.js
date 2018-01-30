'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import Header from './header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'
import InspectContainer from '../containers/inspect'

const App = () => (
  <Fragment>
    <Sprite />
    <Header />
    <TableContainer />
    <StatusBarContainer />
    <Dialog.LinkContainer />
    <Dialog.ConfirmContainer />
    <InspectContainer />
  </Fragment>
)

export default App
