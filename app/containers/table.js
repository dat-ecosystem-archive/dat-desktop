'use strict'

import Table from '../components/table'
import { shareDat, deleteDat, inspectDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats,
  showInspect: state.inspect.show
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  inspectDat: key => dispatch(inspectDat(key))
})

const TableContainer = connect(mapStateToProps, mapDispatchToProps)(Table)

export default TableContainer
