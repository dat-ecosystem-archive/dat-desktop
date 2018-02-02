import Header from '../components/header'
import { createDat } from '../actions'
import { connect } from 'react-redux'

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
  onShare: () => dispatch(createDat())
})

const HeaderContainer = connect(mapStateToProps, mapDispatchToProps)(Header)

export default HeaderContainer
