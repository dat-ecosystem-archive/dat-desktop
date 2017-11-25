const remoteProcess = require('electron').remote.process
const clipboard = require('electron').clipboard
const Modal = require('base-elements/modal')
const app = require('electron').remote.app
const remote = require('electron').remote
const minimist = require('minimist')
const morph = require('nanomorph')
const html = require('choo/html')
const assert = require('assert')
const rimraf = require('rimraf')
const css = require('sheetify')
const path = require('path')
const fs = require('fs')
const os = require('os')

const button = require('./button')
const icon = require('./icon')

const prefix = css`
  :host {
    min-width: 25rem;
    max-width: 32rem;
    padding: 2rem 2.5rem 2rem;
    background-color: var(--color-white);
    box-shadow: 0 1.2rem 2.4rem rgba(0,0,0,.5);
  }
  :host .exit {
    border: none;
    color: var(--color-neutral-40);
  }
  :host .exit:hover,
  :host .exit:focus {
    color: var(--color-neutral);
  }
  :host .icon-cross {
    vertical-align: middle;
    width: 1.6em;
    max-height: 1.6em;
    transition: color .025s ease-out;
    margin-right: auto;
    margin-left: auto;
  }
`

const input = css`
  :host {
    --input-height: 3rem;
    --icon-height: 1.2rem;
    --button-width: 3rem;
    height: var(--input-height);
    border: 0;
    .dat-input-button {
      width: var(--button-width);
      height: calc(var(--input-height) - 2px);
      top: 1px;
      right: 1px;
      bottom: 1px;
      background-color: var(--color-neutral-10);
      border: none;
      color: var(--color-neutral-30);
      &:hover,
      &:focus {
        outline: none;
        color: var(--color-green-hover);
      }
    }

    .icon-link,
    .icon-clipboard {
      position: absolute;
      top: 0;
      bottom: 0;
      padding-top: calc(var(--icon-height) - .35rem);
      padding-left: .75rem;
      pointer-events: none;
      display: block;
      width: var(--icon-height);
      height: var(--icon-height);
      transition: color .025s ease-out;
    }
    .icon-link {
      left: 0;
      color: var(--color-neutral-30);
    }
    .icon-clipboard {
      right: .8rem;
    }
    .dat-input-input {
      width: 100%;
      height: var(--input-height);
      padding-right: var(--button-width);
      padding-left: 2.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: 1px solid var(--color-neutral-20);
      background-color: var(--color-white);
      color: var(--color-green-hover);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      &:hover,
      &:focus {
        outline: none;
      }
    }

    .dat-input-check {
      color: var(--color-blue);
      top: 2rem;
    }
    .icon-check {
      width: var(--icon-height);
      height: .875rem;
      vertical-align: -.15rem;
      display: inline-block;
    }
    .confirmation {
      right: 0;
      opacity: 0;
      top: -.5rem;
      color: var(--color-blue);
    }
    .show-confirmation {
      top: -1.2rem;
      opacity: 1;
      transition: all .15s ease-out;
    }
  }
`

module.exports.confirm = confirmModal
module.exports.crash = crashModal
module.exports.error = errorModal
module.exports.warn = warningModal
module.exports.link = linkModal

function confirmModal () {
  return Modal({
    render: render,
    onexit: onexit,
    class: 'modal'
  })

  function onexit () {
    const el = document.querySelector('.modal')
    if (el) el.parentNode.removeChild(el)
  }

  function render (cb) {
    assert.equal(typeof cb, 'function', 'elements/confirm-modal: cb should be a function')

    var deleteButton = button.green('Yes, Remove Dat', {
      class: 'fr ml3 confirm-button',
      onclick: ondelete,
      onload: function () {
        deleteButton.focus()
      }
    })

    var exitButton = button('No, Cancel', {
      class: 'fr cancel-button',
      onclick: onexit
    })

    return html`
      <section class="relative flex flex-column justify-center ${prefix}">
        <h3 class="f4">
          Remove Dat
        </h3>
        <p class="mt3 mb4 f7 color-neutral-70">
          Are you sure you want to remove this dat?
          <br>
          This can’t be undone.
        </p>
        <p>
          ${deleteButton}
          ${exitButton}
        </p>
        <button
          onclick=${onexit}
          class="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
          aria-label="Close Modal">
          ${icon('cross')}
        </button>
      </section>
    `

    function ondelete () {
      cb()
      onexit()
    }
  }
}

function crashModal () {
  return Modal({ render: render })

  function render (onOk, onExit) {
    return html`
      <div class="relative flex flex-column justify-center pa0 ${prefix}">
        <section>
          <h3 class="f4">Unexpected issue</h3>
          <p class="mt3 mb4 f7 color-neutral-70">
            There was an unexpected fatal issue. The app will now close. We
            have received a bug report and will work to fix this as soon as
            possible.
          </p>
          <p class="pb4 cf">
            ${button.green('Exit Application', {
              class: 'fr ml3',
              onclick: onexit
            })}
          </p>
        </section>
        <section class="pa4 bg-yellow-disabled">
          <p class="mt3 mb4 f7 color-neutral-70">
            <strong>Danger Zone:</strong> If this error keeps occurring you can
            try to clear the database or delete all data. These actions cannot
            be reversed.
          </p>
          <p>
            ${button.red('Clear Database & exit', {
              class: 'fr ml3',
              onclick: clearDatabase
            })}
            ${button.red('Delete All Data & exit', {
              class: 'fr ml3',
              onclick: deleteData
            })}
          </p>
        </section>
      </div>
    `
  }

  function onexit () {
    var window = remote.getCurrentWindow()
    window.close()
  }

  function deleteData () {
    const argv = minimist(remoteProcess.argv.slice(2))
    const downloadsDir = (argv.data)
      ? argv.data
      : path.join(app.getPath('downloads'), '/dat')
    rimraf(downloadsDir, onexit)
  }

  function clearDatabase () {
    const dbLocation = path.join(os.homedir(), '.dat-desktop')
    const dbFile = path.join(dbLocation, 'dats.json')
    fs.unlink(dbFile, onexit)
  }
}

function errorModal () {
  return Modal({
    render: render,
    onexit: onexit,
    class: 'modal'
  })

  function render (message) {
    var exitButton = button.green('Ok', {
      class: 'fr ml3',
      onclick: onexit,
      onload: function () {
        exitButton.focus()
      }
    })

    return html`
      <div class="relative flex flex-column justify-center ${prefix}">
        <section>
          <h3 class="f4">Oops, something went wrong</h3>
          <p class="mt3 mb4 f7 color-neutral-70 overflow-x-auto">
            ${message}
          </p>
          <p>
            ${exitButton}
          </p>
        </section>
      </div>
    `
  }

  function onexit () {
    const el = document.querySelector('.modal')
    if (el) el.parentNode.removeChild(el)
  }
}

function warningModal () {
  return Modal({
    render: render,
    onexit: onexit,
    class: 'modal'
  })

  function render (message) {
    var exitButton = button.green('Ok', {
      class: 'fr ml3',
      onclick: onexit,
      onload: function () {
        exitButton.focus()
      }
    })

    return html`
      <div class="relative flex flex-column justify-center ${prefix}">
        <section class="pa4">
          <h3 class="f4">Warning</h3>
          <p class="mt3 mb4 f7 color-neutral-70">
            ${message}
          </p>
          <p>
            ${exitButton}
          </p>
        </section>
      </div>
    `
  }

  function onexit () {
    const el = document.querySelector('.modal')
    if (el) el.parentNode.removeChild(el)
  }
}

function linkModal () {
  let isCopied = false
  let link = ''
  let el = ''

  const modal = Modal({
    onunload: onunload,
    onexit: onexit,
    render: render,
    class: 'modal'
  })

  return modal

  function onexit () {
    const el = document.querySelector('.modal')
    if (el) el.parentNode.removeChild(el)
  }

  function onunload () {
    isCopied = false
    link = ''
    el = null
  }

  function render (newLink) {
    if (!link) link = 'dat://' + newLink
    const confirmClass = (isCopied) ? 'show-confirmation' : ''

    let _el = html`
      <section class="relative flex flex-column justify-center ${prefix}">
        <h3 class="f4">
          Copy Dat Link
        </h3>
        <label for="dat-link" class="relative mt4 mb4 ${input}">
          <p class="f7 mt0 mb0 tr absolute confirmation ${confirmClass}">
            ${icon('check')}
            Link copied to clipboard
          </p>
          <input name="dat-link" type="text" value=${link} class="relative dib pa0 dat-input-input">
          ${icon('link')}
          <button class="absolute pointer dat-input-button" title="Copy to Clipboard" aria-label="Copy to Clipboard" onclick=${onclick}>
            ${icon('clipboard')}
          </button>
        </label>
        <p class="f7 color-neutral-70">
          Anyone with this link can view your Dat.
        </p>
        <button
          onclick=${onexit}
          class="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
          aria-label="Close Modal">
          ${icon('cross')}
        </button>
      </section>
    `

    if (!el) el = _el
    return _el

    function onclick () {
      isCopied = true
      clipboard.writeText(link)
      var _el = render()
      morph(el, _el)
    }
  }
}
