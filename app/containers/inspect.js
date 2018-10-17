'use strict'

import SCREEN from '../consts/screen'
import Inspect from '../components/inspect'
import { closeInspectDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dat: state.screen === SCREEN.INSPECT ? state.dats[state.inspect.key] : null
})

const mapDispatchToProps = dispatch => ({
  closeInspectDat: () => dispatch(closeInspectDat())
})

const InspectContainer = connect(mapStateToProps, mapDispatchToProps)(Inspect)

export default InspectContainer
