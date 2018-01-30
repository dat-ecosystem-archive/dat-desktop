'use strict'

import StatusBar from '../components/status-bar'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  up: state.speed.up,
  down: state.speed.down
})

const mapDispatchToProps = dispatch => ({})

const StatusBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(StatusBar)

export default StatusBarContainer