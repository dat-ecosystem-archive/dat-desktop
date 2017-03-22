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
  const dats = state.repos.values
  const isReady = state.repos.ready

  const header = Header({
    isReady: isReady,
    oncreate: () => emit('create repo'),
    onimport: (link) => emit('clone repo', link)
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
            emit('hide welcome screen')
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
      ${Table(dats, emit)}
    </div>
  `

  function captureKeyEvent (e) {
    const key = e.code
    if (key === 'Enter' || key === 'Space') {
      window.removeEventListener('keydown', captureKeyEvent)
      emit('hide welcome screen')
    }
  }
}
