'use strict'

import { connect } from 'react-redux'
import TitleField from '../components/title-field'
import {
  updateTitle,
  activateTitleEditing,
  editTitle,
  deactivateTitleEditing
} from '../actions'

const makeMapStateToProps = (initialState, initialProps) => {
  const { key } = initialProps.dat
  const mapStateToProps = state => ({
    dat: state.dats[key],
    titleUnderEdit: state.titleUnderEdit
  })

  return mapStateToProps
}

const mapDispatchToProps = dispatch => ({
  updateTitle: (key, path, editValue) =>
    dispatch(updateTitle(key, path, editValue)),
  activateTitleEditing: (title, editable) =>
    dispatch(activateTitleEditing(title)),
  editTitle: title => dispatch(editTitle(title)),
  deactivateTitleEditing: () => dispatch(deactivateTitleEditing())
})

const TitleFieldContainer = connect(makeMapStateToProps, mapDispatchToProps)(
  TitleField
)

export default TitleFieldContainer
