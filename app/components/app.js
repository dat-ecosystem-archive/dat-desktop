'use strict'

import React, { Fragment } from 'react'
import Sprite from './sprite'
import HeaderContainer from '../containers/header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'
import InspectContainer from '../containers/inspect'
import DragDropContainer from '../containers/drag-drop'

const App = () => (
  <Fragment>
    <Sprite />
    <HeaderContainer />
    <TableContainer />
    <Dialog.LinkContainer />
    <Dialog.ConfirmContainer />
    <InspectContainer />
    <StatusBarContainer />
    <DragDropContainer />
  </Fragment>
)

export default App
