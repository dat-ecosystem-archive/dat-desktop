'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import Header from './header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'
import DragDropContainer from '../containers/drag-drop'

const App = () => (
  <Fragment>
    <Sprite />
    <Header />
    <TableContainer />
    <Dialog.LinkContainer />
    <Dialog.ConfirmContainer />
    <StatusBarContainer />
    <DragDropContainer />
  </Fragment>
)

export default App
