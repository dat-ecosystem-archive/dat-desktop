import FileList from '../components/file-list'
import { viewFile } from '../actions'
import { connect } from 'react-redux'

export const FileListContainer = connect(
  state => ({
    dat: state.dats[state.inspect.key]
  }),
  (dispatch, ownProps) => ({
    onClickFile: path => dispatch(viewFile({ key: ownProps.dat.key, path }))
  })
)(FileList)
