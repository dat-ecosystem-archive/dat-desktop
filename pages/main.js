'use strict'

const html = require('choo/html')
const css = require('sheetify')

const Header = require('../elements/header')
const button = require('../elements/button')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')
const icon = require('../elements/icon')

const skeleton = css`
  :host {
    position: relative;
    .skeleton {
      position: fixed;
      top: 3.5rem;
      left: 1.25rem;
      width: 232px;
      max-width: 100vw;
    }
    .dotted-lines {
      position: absolute;
      top: .25rem;
      right: 5.5rem;
      width: 17rem;
      z-index: 3;
    }
    .create-new-dat,
    .link {
      position: absolute;
      width: 15rem;
    }
    .create-new-dat {
      top: 14.5rem;
      right: 4rem;
    }
    .link {
      top: 6rem;
      right: 8.5rem;
      color: red;
    }
    .icon-create-new-dat,
    .icon-link {
      width: 2rem;
      height: 2rem;
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
    -webkit-app-region: drag;
  }
`

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const showWelcomeScreen = state.mainView.welcome
  const dats = state.repos.values

  const header = Header({
    create: () => send('repos:create'),
    download: (link) => send('repos:clone', link)
  })

  document.title = 'Dat Desktop'

  if (showWelcomeScreen) {
    document.title = 'Dat Desktop | Welcome'
    return html`
      <body>
        ${sprite()}
        ${WelcomeScreen({
          onexit: () => send('mainView:toggleWelcomeScreen', { toggle: false })
        })}
      </body>
    `
  }

  if (!dats.length) {
    return html`
      <body>
        ${sprite()}
        ${header}
        ${EmptyState()}
      </body>
    `
  }

  return html`
    <body>
      ${sprite()}
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
      <img src="./public/img/table-skeleton.svg" alt="" class="skeleton">
      <div class="tutorial">
        <img src="./public/img/dotted-lines.svg" alt="" class="dotted-lines">
        <div class="link">
          ${icon({
            id: 'link',
            cls: 'color-blue-disabled'
          })}
          <h3 class="f4 ttu mt0 mb0 color-blue-disabled">Import Dat</h3>
          <p class="f7 color-neutral-40">
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
          <h3 class="f4 ttu mt0 mb0 color-green-disabled">Create New Dat</h3>
          <p class="f7 color-neutral-40">
            … or select one of your local
            <br>
            datasets and start sharing it.
          </p>
        </div>
      </div>
    </main>
  `
}
