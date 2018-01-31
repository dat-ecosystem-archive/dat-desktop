'use strict'

import Table from '../components/table'
import { shareDat, deleteDat, togglePause } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  onTogglePause: dat => dispatch(togglePause(dat))
})

const TableContainer = connect(mapStateToProps, mapDispatchToProps)(Table)

export default TableContainer
