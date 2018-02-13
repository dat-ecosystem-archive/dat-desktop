import DatImport from '../components/dat-import'
import { showDownloadScreen, downloadSparseDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => state

const mapDispatchToProps = dispatch => {
  return {
    showDownloadScreen: key => dispatch(showDownloadScreen(key)),
    downloadSparseDat: key => dispatch(downloadSparseDat(key))
  }
}

const DatImportContainer = connect(mapStateToProps, mapDispatchToProps)(
  DatImport
)

export default DatImportContainer
