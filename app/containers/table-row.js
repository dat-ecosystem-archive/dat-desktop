'use strict'

import { connect } from 'react-redux'
import TableRow from '../components/table-row'
import { shareDat, deleteDat, togglePause, inspectDat } from '../actions'

const makeMapStateToProps = (initialState, initialProps) => {
  const { datKey } = initialProps
  const mapStateToProps = state => ({
    dat: state.dats[datKey]
  })

  return mapStateToProps
}

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  inspectDat: key => dispatch(inspectDat(key)),
  onTogglePause: dat => dispatch(togglePause(dat))
})

const TableRowContainer = connect(makeMapStateToProps, mapDispatchToProps)(
  TableRow
)

export default TableRowContainer
