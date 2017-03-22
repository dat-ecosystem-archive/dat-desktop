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
      svg {
        display: inline-block;
        width: 2rem;
        height: 2rem;
      }
    }
    .link {
      top: 6rem;
      right: 8.5rem;
      color: red;
      svg {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        margin-bottom: -.75rem;
      }
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
function mainView (state, emit) {
  const showWelcomeScreen = state.mainView.welcome
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
        ${WelcomeScreen({
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
        ${EmptyState()}
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
      emit('mainView:toggleWelcomeScreen', { toggle: false })
    }
  }
}

function WelcomeScreen (methods) {
  const onexit = methods.onexit
  const onLoad = methods.onload

  return html`
    <main class="${welcome}" onload=${onLoad}>
      <img src="./public/img/logo-dat-desktop.svg" alt="" class="">
      <p class="mv4">
        Share data on the distributed web.
      </p>
      ${button.green('Get Started', { onclick: onexit })}
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
          ${icon('link', { class: 'color-blue-disabled' })}
          <h3 class="f4 ttu mt0 mb0 color-blue-disabled">
            Import Dat
          </h3>
          <p class="f7 color-neutral-40">
            Download an existing dataset
            <br>
            by entering its dat link…
          </p>
        </div>
        <div class="tr create-new-dat">
          ${icon('create-new-dat', { class: 'color-green-disabled' })}
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
