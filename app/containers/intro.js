'use strict'

import SCREEN from '../consts/screen'
import { connect } from 'react-redux'
import IntroScreen from '../components/intro'
import { openHomepage, nextIntro, hideIntro } from '../actions'

const mapStateToProps = state => ({
  show: state.screen === SCREEN.INTRO,
  screen: state.intro.screen
})

const mapDispatchToProps = dispatch => ({
  openHomepage: () => openHomepage(),
  next: screen => dispatch(nextIntro(screen)),
  hide: () => dispatch(hideIntro())
})

const IntroContainer = connect(mapStateToProps, mapDispatchToProps)(IntroScreen)

export default IntroContainer
