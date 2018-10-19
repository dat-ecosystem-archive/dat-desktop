'use strict'

import SCREEN from '../consts/screen'
import StatusBar from '../components/status-bar'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  up: state.speed.up,
  down: state.speed.down,
  show: state.screen === SCREEN.DATS
})

const mapDispatchToProps = dispatch => ({})

const StatusBarContainer = connect(mapStateToProps, mapDispatchToProps)(
  StatusBar
)

export default StatusBarContainer
