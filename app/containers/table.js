'use strict'

import Table from '../components/table'
import { shareDat, deleteDat, togglePause, inspectDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats,
  show: !state.inspect.key
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  onTogglePause: key => dispatch(togglePause(key)),
  inspectDat: key => dispatch(inspectDat(key))
})

const TableContainer = connect(mapStateToProps, mapDispatchToProps)(Table)

export default TableContainer
