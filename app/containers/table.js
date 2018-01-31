'use strict'

import Table from '../components/table'
import { shareDat, deleteDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key))
})

const TableContainer = connect(mapStateToProps, mapDispatchToProps)(Table)

export default TableContainer
