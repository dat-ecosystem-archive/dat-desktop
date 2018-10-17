'use strict'

import Inspect from '../components/inspect'
import { closeInspectDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dat: state.screen === 'inspect' ? state.dats[state.inspect.key] : null
})

const mapDispatchToProps = dispatch => ({
  closeInspectDat: () => dispatch(closeInspectDat())
})

const InspectContainer = connect(mapStateToProps, mapDispatchToProps)(Inspect)

export default InspectContainer
