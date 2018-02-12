'use strict'

import Table from '../components/table'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats,
  show: state.screen === 'dats'
})

const TableContainer = connect(mapStateToProps, null)(Table)

export default TableContainer
