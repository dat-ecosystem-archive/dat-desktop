'use strict'

const SvgSprite = require('dat-icons')
const html = require('choo/html')

const Header = require('../elements/header')
const Table = require('../elements/table')
const Modal = require('../elements/modal')

const modal = Modal()

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const dats = state.app.archives

  const header = Header({
    create: () => send('app:create'),
    download: (link) => send('app:download', link)
  })

  // show welcome state, empty state or archives overview in the main view
  if (dats.length) {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${Table(dats, send)}
        ${modal(state.location.search.modal)}
      </body>
    `
  } else {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${EmptyState()}
      </body>
    `
  }
}

function EmptyState () {
  return html`
    <main>
      <div>[ unstyled empty state ]</div>
    </main>
  `
}

function svgSprite () {
  const _el = document.createElement('div')
  _el.innerHTML = SvgSprite()
  return _el.childNodes[0]
}
