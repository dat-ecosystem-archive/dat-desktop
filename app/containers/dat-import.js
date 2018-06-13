import DatImport from '../components/dat-import'
import { requestDownload, downloadSparseDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => state

const mapDispatchToProps = dispatch => {
  return {
    requestDownload: key => dispatch(requestDownload(key)),
    downloadSparseDat: key => dispatch(downloadSparseDat(key))
  }
}

const DatImportContainer = connect(mapStateToProps, mapDispatchToProps)(
  DatImport
)

export default DatImportContainer
