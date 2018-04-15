import Header from '../components/header'
import { createDat, toggleMenu } from '../actions'
import { connect } from 'react-redux'
import { shell } from 'electron'

const mapStateToProps = state => ({
  menuVisible: state.menu.visible,
  version: state.version
})

const mapDispatchToProps = dispatch => ({
  onShare: () => dispatch(createDat()),
  onMenu: (visible) => dispatch(toggleMenu(visible)),
  onReport: () => shell.openExternal('https://github.com/dat-land/dat-desktop/issues/')
})

const HeaderContainer = connect(mapStateToProps, mapDispatchToProps)(Header)

export default HeaderContainer
