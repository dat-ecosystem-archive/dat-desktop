'use strict'

const SvgSprite = require('dat-icons')
const css = require('sheetify')
const html = require('choo/html')

const Header = require('../elements/header')
const Table = require('../elements/table')
const Modal = require('../elements/modal')

const modal = Modal()

css('dat-colors')

var prefix = css`
  :host {
    position: relative;
    background: url()
  }
  .skeleton {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100vw;
  }
  .tutorial {
    display: none;
  }
  .lines {
    position: absolute;
    top: .25rem;
    right: 6rem;
    width: 17rem;
    z-index: 3;
  }
  .create-new-dat,
  .link {
    position: absolute;
    width: 16rem;
    background-color: var(--color-white);
  }
  .create-new-dat {
    top: 13.75rem;
    right: 2rem;
  }
  .link {
    top: 6rem;
    right: 8.5rem;
    color: red;
  }
  .create-new-dat-svg,
  .link-svg {
    width: 3rem;
    height: 3rem;
    fill: currentColor;
  }
  .link-svg {
    margin-bottom: -.75rem;
  }
  .color-neutral-30 {
    color: var(--color-neutral-30);
  }
  .color-info-disabled {
    color: var(--color-info-disabled);
  }
  .color-green-disabled {
    color: var(--color-green-disabled);
  }

`

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
    <main class="${prefix}">
      <img src="./public/img/table-skeleton-2.svg" alt="" class="skeleton">
      <div class="tutorial">
        <img src="./public/img/lines.svg" alt="" class="lines">
        <div class="link">
          <svg class="color-info-disabled link-svg">
            <use xlink:href="#daticon-link" />
          </svg>
          <h3 class="f3 ttu mt0 mb0 color-info-disabled">Import Dat</h3>
          <p class="f6 color-neutral-30">
            Download an existing dataset
            <br>
            by entering its dat link…
          </p>
        </div>
        <div class="tr create-new-dat">
          <svg class="color-green-disabled create-new-dat-svg">
            <use xlink:href="#daticon-create-new-dat" />
          </svg>
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
