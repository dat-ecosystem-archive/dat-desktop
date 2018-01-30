'use strict'

import Inspect from '../components/inspect'
import { closeInspectDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dat: state.dats[state.inspect.key]
})

const mapDispatchToProps = dispatch => ({
  closeInspectDat: dat => dispatch(closeInspectDat)
})

const InspectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Inspect)

export default InspectContainer
