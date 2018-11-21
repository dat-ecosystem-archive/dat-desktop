'use strict'

import React, { Fragment } from 'react'
import { connect } from 'react-redux'

import SCREEN from '../consts/screen'

import IntroContainer from '../containers/intro'
import HeaderContainer from '../containers/header'
import TableContainer from '../containers/table'
import * as Dialog from '../containers/dialog'
import StatusBarContainer from '../containers/status-bar'
import InspectContainer from '../containers/inspect'
import DragDropContainer from '../containers/drag-drop'
import DownloadContainer from '../containers/download'

const mapStateToProps = state => ({
  screen: state.screen
})

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(function ({
  screen
}) {
  if (screen === SCREEN.INTRO) {
    return <IntroContainer />
  }
  return (
    <Fragment>
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
})
