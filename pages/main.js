'use strict'

const html = require('choo/html')
const shell = require('electron').shell

const StatusBar = require('../elements/status-bar')
const Download = require('../elements/download')
const Inspect = require('../elements/inspect')
const Header = require('../elements/header')
const Sprite = require('../elements/sprite')
const Table = require('../elements/table')
const Intro = require('../elements/intro')
const Empty = require('../elements/empty')

module.exports = mainView

const statusBar = StatusBar()
const download = Download()
const inspect = Inspect()
const header = Header()
const sprite = Sprite()
const intro = Intro()

// render the main view
// (obj, obj, fn) -> html
function mainView (state, emit) {
  const showIntroScreen = state.intro.show
  const showInspectScreen = state.inspect.show
  const showDownloadScreen = state.download.show
  const dats = state.dats.values
  const isReady = state.dats.ready
  const headerProps = {
    isReady: isReady,
    onupdate: () => emit('render'),
    oncreate: () => emit('dats:create'),
    onimport: (link) => emit('dats:download', link),
    onreport: () => shell.openExternal('https://github.com/datproject/dat-desktop/issues')
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
          },
          onupdate: () => {
            emit('render')
          }
        }))}
      </div>
    `
  }

  if (showInspectScreen) {
    return html`
      <div>
        ${sprite.render()}
        ${header.render(headerProps)}
        ${inspect.render(Object.assign({}, state.inspect, {
          oncancel: () => emit('inspect:hide'),
          onupdate: () => emit('render')
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
          },
          onupdate: () => {
            emit('render')
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
        ${statusBar.render(state.dats.speed)}
      </div>
    `
  }

  return html`
    <div>
      ${sprite.render()}
      ${header.render(headerProps)}
      ${Table(state, emit)}
      ${statusBar.render(state.dats.speed)}
    </div>
  `
}
