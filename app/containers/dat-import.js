import DatImport from '../components/dat-import'
import { addDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => state

const mapDispatchToProps = dispatch => {
  return {
    onAddDat: key => dispatch(addDat({ key }))
  }
}

const DatImportContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DatImport)

export default DatImportContainer