'use strict'

import Download from '../components/download'
import {
  addDat,
  hideDownloadScreen,
  cancelDownloadDat,
  changeDownloadPath
} from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  show: state.screen === 'download',
  dat: state.dats[state.downloadDatKey]
})

const mapDispatchToProps = dispatch => ({
  addDat: ({ key, path }) => dispatch(addDat({ key, path })),
  hideDownloadScreen: () => dispatch(hideDownloadScreen()),
  cancelDownloadDat: key => dispatch(cancelDownloadDat(key)),
  changeDownloadPath: key => dispatch(changeDownloadPath(key))
})

const DownloadContainer = connect(mapStateToProps, mapDispatchToProps)(Download)

export default DownloadContainer
