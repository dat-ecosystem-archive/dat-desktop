'use strict'

import { connect } from 'react-redux'
import TableRow from '../components/table-row'
import {
  shareDat,
  deleteDat,
  togglePause,
  inspectDat,
  updateTitle
} from '../actions'

const mapStateToProps = (state, ownProps) => ({
  dat: ownProps.dat
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  inspectDat: key => dispatch(inspectDat(key)),
  onTogglePause: dat => dispatch(togglePause(dat)),
  updateTitle: (key, title) => dispatch(updateTitle(key, title))
})

const TableRowContainer = connect(mapStateToProps, mapDispatchToProps)(TableRow)

export default TableRowContainer
