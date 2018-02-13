'use strict'

import Viewer from '../components/viewer'
import { connect } from 'react-redux'
import { closeViewFile, dats } from '../actions'

const mapStateToProps = state => ({
  show: !!state.view.key,
  key: state.view.key,
  path: state.view.path,
  dat: dats[state.view.key] && dats[state.view.key].dat
})

const mapDispatchToProps = dispatch => ({
  onExit: () => dispatch(closeViewFile())
})

const ViewerContainer = connect(mapStateToProps, mapDispatchToProps)(Viewer)

export default ViewerContainer
