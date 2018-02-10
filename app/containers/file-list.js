import FileList from '../components/file-list'
import { viewFile } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  dat: state.dats[state.inspect.key]
})

const mapPropsToDispatch = (dispatch, ownProps) => ({
  onClickFile: path => dispatch(viewFile({ key: ownProps.dat.key, path }))
})

const FileListContainer = connect(mapStateToProps, mapPropsToDispatch)(FileList)

export default FileListContainer
