'use strict'

import React, { Fragment } from 'react'
import IntroContainer from '../containers/intro'
import HeaderContainer from '../containers/header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'
import InspectContainer from '../containers/inspect'
import DragDropContainer from '../containers/drag-drop'
import DownloadContainer from '../containers/download'

const App = () => (
  <Fragment>
    <IntroContainer />
    <HeaderContainer />
    <TableContainer />
    <Dialog.LinkContainer />
    <Dialog.ConfirmContainer />
    <InspectContainer />
    <StatusBarContainer />
    <DragDropContainer />
    <DownloadContainer />
  </Fragment>
)

export default App
