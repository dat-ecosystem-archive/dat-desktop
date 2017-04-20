'use strict'

const html = require('choo/html')

const Header = require('../elements/header')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')
const Welcome = require('../elements/welcome')
const Empty = require('../elements/empty')

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, emit) {
  const showWelcomeScreen = state.welcome.show
  const dats = state.dats.values
  const isReady = state.dats.ready

  const header = Header({
    isReady: isReady,
    oncreate: () => emit('dats:create'),
    onimport: (link) => emit('dats:clone', link)
  })

  document.title = 'Dat Desktop'

  if (showWelcomeScreen) {
    document.title = 'Dat Desktop | Welcome'
    return html`
      <div>
        ${sprite()}
        ${Welcome({
          onexit: () => {
            window.removeEventListener('keydown', captureKeyEvent)
            emit('welcome:hide')
          },
          onload: () => {
            window.addEventListener('keydown', captureKeyEvent)
          }
        })}
      </div>
    `
  }

  if (!dats.length) {
    return html`
      <div>
        ${sprite()}
        ${header}
        ${Empty()}
      </div>
    `
  }

  return html`
    <div>
      ${sprite()}
      ${header}
      ${Table(state, emit)}
    </div>
  `

  function captureKeyEvent (e) {
    const key = e.code
    if (key === 'Enter' || key === 'Space') {
      window.removeEventListener('keydown', captureKeyEvent)
      emit('welcome:hide')
    }
  }
}
