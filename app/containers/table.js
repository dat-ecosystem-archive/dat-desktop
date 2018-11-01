'use strict'

import SCREEN from '../consts/screen'
import Table from '../components/table'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats,
  show: state.screen === SCREEN.DATS
})

const TableContainer = connect(mapStateToProps, null)(Table)

export default TableContainer
