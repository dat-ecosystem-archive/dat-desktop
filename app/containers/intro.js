'use strict'

import { connect } from 'react-redux'
import IntroScreen from '../components/intro'
import { onHomepage, nextIntro, hideIntro } from '../actions'

const mapStateToProps = state => ({
  show: state.intro.show && !state.dats.length,
  screen: state.intro.screen
})

const mapDispatchToProps = dispatch => ({
  onHomepage: () => onHomepage(),
  next: (screen) =>  dispatch(nextIntro(screen)),
  hide: () => dispatch(hideIntro())
})

const IntroContainer = connect(mapStateToProps, mapDispatchToProps)(IntroScreen)

export default IntroContainer
