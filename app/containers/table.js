'use strict'

import Table from '../components/table'
import {
  shareDat,
  deleteDat,
  inspectDat,
  updateTitle,
  makeEditable,
  editTitle,
  deactivate
} from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dats: state.dats,
  show: !state.inspect.key,
  editing: state.editing
})

const mapDispatchToProps = dispatch => ({
  shareDat: link => dispatch(shareDat(link)),
  onDeleteDat: key => dispatch(deleteDat(key)),
  inspectDat: key => dispatch(inspectDat(key)),
  updateTitle: (key, path, editValue) =>
    dispatch(updateTitle(key, path, editValue)),
  makeEditable: (title, editable) => dispatch(makeEditable(title)),
  editTitle: title => dispatch(editTitle(title)),
  deactivate: () => dispatch(deactivate())
})

const TableContainer = connect(mapStateToProps, mapDispatchToProps)(Table)

export default TableContainer
