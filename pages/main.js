'use strict'

const html = require('choo/html')

const Header = require('../elements/header')
const Sprite = require('../elements/sprite')
const Table = require('../elements/table')
const Intro = require('../elements/intro')
const Empty = require('../elements/empty')
const Inspect = require('../elements/inspect')

module.exports = mainView

const header = Header()
const sprite = Sprite()
const intro = Intro()
const inspect = Inspect()

// render the main view
// (obj, obj, fn) -> html
function mainView (state, emit) {
  const showIntroScreen = state.intro.show
  const showInspectScreen = state.inspect.show
  const dats = state.dats.values
  const isReady = state.dats.ready
  const headerProps = {
    isReady: isReady,
    oncreate: () => emit('dats:create'),
    onimport: (link) => emit('dats:clone', link)
  }

  document.title = 'Dat Desktop'

	if (showInspectScreen) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${inspect.render(Object.assign({}, state.inspect, {
          oncancel: () => emit('inspect:hide')
        }))}
      </div>
    `
  }

  if (showIntroScreen) {
    document.title = 'Dat Desktop | Welcome'
    return html`
      <div>
        ${sprite.render()}
        ${intro.render({
          onexit: () => {
            emit('intro:hide')
          },
          onOpenHomepage: () => {
            emit('intro:open-homepage')
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
}
