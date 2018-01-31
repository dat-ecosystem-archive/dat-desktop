import FileDrop from 'react-file-drop'
import { connect } from 'react-redux'
import { dropFolder } from '../actions'

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
  onDrop: list => dispatch(dropFolder(list[0]))
})

const DragDropContainer = connect(mapStateToProps, mapDispatchToProps)(FileDrop)

export default DragDropContainer
