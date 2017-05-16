'use strict'

const html = require('choo/html')

const Header = require('../elements/header')
const Sprite = require('../elements/sprite')
const Table = require('../elements/table')
const Welcome = require('../elements/welcome')
const Empty = require('../elements/empty')
const Download = require('../elements/download')

module.exports = mainView

const header = Header()
const sprite = Sprite()
const download = Download()

// render the main view
// (obj, obj, fn) -> html
function mainView (state, emit) {
  const showWelcomeScreen = state.welcome.show
  const showDownloadScreen = state.download.show
  const dats = state.dats.values
  const isReady = state.dats.ready
  const headerProps = {
    isReady: isReady,
    oncreate: () => emit('dats:create'),
    onimport: (link) => emit('dats:download', link)
  }

  document.title = 'Dat Desktop'

  if (showDownloadScreen) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${download.render(Object.assign({}, state.download, {
          oncancel: () => emit('download:hide'),
          ondownload: ({ key, location }) => {
            emit('dats:clone', { key, location })
            emit('download:hide')
          }
        }))}
      </div>
    `
  }

  if (showWelcomeScreen) {
    document.title = 'Dat Desktop | Welcome'
    return html`
      <div>
        ${sprite.render()}
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
        ${sprite.render()}
        ${header.render(headerProps)}
        ${Empty()}
      </div>
    `
  }

  return html`
    <div>
      ${sprite.render()}
      ${header.render(headerProps)}
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
