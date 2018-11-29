'use strict'

import SCREEN from '../consts/screen'

// immutable
export default () => ({
  dats: {},
  screen: SCREEN.INTRO,
  dialogs: {
    link: {
      link: null,
      copied: false
    },
    delete: {
      dat: null
    }
  },
  speed: {
    up: 0,
    down: 0
  },
  inspect: {
    key: null
  },
  intro: {
    screen: 1
  },
  version: require('../../package.json').version,
  menu: {
    visible: false
  },
  downloadDatKey: null
})