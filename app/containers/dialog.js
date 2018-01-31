import { Link } from '../components/dialog'
import { copyLink, closeShareDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  link: state.dialogs.link.link,
  copied: state.dialogs.link.copied
})

const mapDispatchToProps = dispatch => ({
  onCopy: link => dispatch(copyLink(link)),
  onExit: () => dispatch(closeShareDat())
})

const LinkContainer = connect(mapStateToProps, mapDispatchToProps)(Link)

export default LinkContainer
