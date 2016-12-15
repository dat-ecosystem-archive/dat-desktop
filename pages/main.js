'use strict'

const SvgSprite = require('dat-icons')
const css = require('sheetify')
const html = require('choo/html')

const Header = require('../elements/header')
const Table = require('../elements/table')
const Modal = require('../elements/modal')
const icon = require('../elements/icon')

const modal = Modal()

css('dat-colors')
css('tachyons')
css('../public/css/base.css')
css('../public/css/colors.css')

const prefix = css`
  :host {
    position: relative;
    background: url()
  }
  :host .skeleton {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
  }
  :host .tutorial {
    display: none;
  }
  :host .lines {
    position: absolute;
    top: .25rem;
    right: 6rem;
    width: 17rem;
    z-index: 3;
  }
  :host .create-new-dat,
  :host .link {
    position: absolute;
    width: 16rem;
    background-color: var(--color-white);
  }
  :host .create-new-dat {
    top: 13.75rem;
    right: 2rem;
  }
  :host .link {
    top: 6rem;
    right: 8.5rem;
    color: red;
  }
  :host .icon-create-new-dat,
  :host .icon-link {
    width: 3rem;
    height: 3rem;
    fill: currentColor;
  }
  :host .icon-link {
    margin-bottom: -.75rem;
  }
`

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const showWelcomeScreen = state.mainView.showWelcomeScreen
  const modalLink = state.location.search.modal
  const dats = state.repos.values

  const header = Header({
    create: () => send('repos:create'),
    download: (link) => send('repos:download', link)
  })

  if (showWelcomeScreen) {
    return html`
      <body>
        ${svgSprite()}
        ${WelcomeScreen({ onexit: () => send('mainView:closeWelcomeScreen') })}
      </body>
    `
  }

  if (!dats.length) {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${EmptyState()}
      </body>
    `
  }

  if (modalLink) {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${Table(dats, send)}
        ${modal(modalLink)}
      </body>
    `
  }

  return html`
    <body>
      ${svgSprite()}
      ${header}
      ${Table(dats, send)}
    </body>
  `
}

function WelcomeScreen (methods) {
  const onExit = methods.onexit
  return html`
    <main>
      <p>Welcome to dat desktop!</p>
      <button onclick=${onExit}>Close screen</button>
    </main>
  `
}

function EmptyState () {
  return html`
    <main class="${prefix}">
      <img src="./public/img/table-skeleton-2.svg" alt="" class="skeleton">
      <div class="tutorial">
        <img src="./public/img/lines.svg" alt="" class="lines">
        <div class="link">
          ${icon({
            id: 'link',
            cls: 'color-blue-disabled'
          })}
          <h3 class="f3 ttu mt0 mb0 color-blue-disabled">Import Dat</h3>
          <p class="f6 color-neutral-30">
            Download an existing dataset
            <br>
            by entering its dat link…
          </p>
        </div>
        <div class="tr create-new-dat">
          ${icon({
            id: 'create-new-dat',
            cls: 'color-green-disabled'
          })}
          <h3 class="f3 ttu mt0 mb0 color-green-disabled">Create New Dat</h3>
          <p class="f6 color-neutral-30">
            … or select one of your local
            <br>
            datasets and start sharing it.
          </p>
        </div>
      </div>
    </main>
  `
}

function svgSprite () {
  const _el = document.createElement('div')
  _el.innerHTML = SvgSprite()
  return _el.childNodes[0]
}
