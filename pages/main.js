'use strict'

const SvgSprite = require('dat-icons')
const css = require('sheetify')
const html = require('choo/html')

const Header = require('../elements/header')
const Table = require('../elements/table')
const linkModal = require('../elements/link-modal')()
const deleteModal = require('../elements/delete-modal')()
const button = require('../elements/button')
const icon = require('../elements/icon')


css('dat-colors')
css('tachyons')
css('../public/css/base.css')
css('../public/css/colors.css')

const skeleton = css`
  :host {
    position: relative;
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
    .icon-create-new-dat,
    .icon-link {
      width: 3rem;
      height: 3rem;
      fill: currentColor;
    }
    .icon-link {
      margin-bottom: -.75rem;
    }
  }
`

const welcome = css`
  :host {
    height: 100vh;
    background-color: var(--color-neutral);
    color: var(--color-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const showWelcomeScreen = state.mainView.showWelcomeScreen
  const shareLink = state.location.search.share
  const deleteLink = state.location.search.delete
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

  if (shareLink) {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${Table(dats, send)}
        ${linkModal(shareLink)}
      </body>
    `
  }

  if (deleteLink) {
    return html`
      <body>
        ${svgSprite()}
        ${header}
        ${Table(dats, send)}
        ${deleteModal(() => send('repos:deleteConfirm', deleteLink))}
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
    <main class="${welcome}">
      <img src="./public/img/logo-dat-desktop.svg" alt="" class="">
      <p class="mv4">
        Share data on the distributed web.
      </p>
      ${button({
        text: 'Get Started',
        style: 'filled-green',
        cls: '',
        click: onExit
      })}
    </main>
  `
}

function EmptyState () {
  return html`
    <main class="${skeleton}">
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
