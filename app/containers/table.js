'use strict'

import Table from '../components/table'
import { shareDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link))
})

const TableContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Table)

export default TableContainer