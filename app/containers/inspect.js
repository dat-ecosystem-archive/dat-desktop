'use strict'

import SCREEN from '../consts/screen'
import Inspect from '../components/inspect'

import {
  closeInspectDat,
  addDat,
  hideDownloadScreen,
  cancelDownloadDat,
  changeDownloadPath
} from '../actions'

import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dat:
    state.screen === SCREEN.INSPECT
      ? state.dats[state.inspect.key]
      : state.screen === SCREEN.DOWNLOAD
        ? state.dats[state.downloadDatKey]
        : null,
  screen: state.screen
})

const mapDispatchToProps = dispatch => ({
  closeInspectDat: () => dispatch(closeInspectDat()),
  addDat: ({ key, path }) => dispatch(addDat({ key, path })),
  hideDownloadScreen: () => dispatch(hideDownloadScreen()),
  cancelDownloadDat: key => dispatch(cancelDownloadDat(key)),
  changeDownloadPath: key => dispatch(changeDownloadPath(key))
})

const InspectContainer = connect(mapStateToProps, mapDispatchToProps)(Inspect)

export default InspectContainer
