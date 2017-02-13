const remoteProcess = require('electron').remote.process
const Modal = require('base-elements/modal')
const app = require('electron').remote.app
const remote = require('electron').remote
const minimist = require('minimist')
const html = require('choo/html')
const rimraf = require('rimraf')
const css = require('sheetify')
const path = require('path')
const fs = require('fs')

const button = require('./button')

const prefix = css`
  :host {
    min-width: 20rem;
    max-width: 25rem;
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
    width: 1.1em;
    max-height: 1.6em;
    transition: color .025s ease-out;
  }
`

module.exports = createWidget

function createWidget () {
  const modal = Modal({ render })

  return modal

  function render (onOk, onExit) {
    return html`
      <div class="relative flex flex-column justify-center ${prefix}">
        <section class="pa4">
          <h3 class="f4">Unexpected issue</h3>
          <p class="mt3 mb4 f7 color-neutral-70">
            There was an unexpected fatal issue. The app will now close. We
            have received a bug report and will work to fix this as soon as
            possible.
          </p>
          <p>
            ${button({
              text: 'Exit Application',
              style: 'filled-green',
              cls: 'fr ml3',
              click: onexit
            })}
          </p>
        </section>
        <section class="pa4" style="background-color: var(--color-yellow-disabled)">
          <p class="mt3 mb4 f7 color-neutral-70">
            <strong>Danger Zone:</strong> If this error keeps occurring you can
            try to clear the database or delete all data. These actions cannot
            be reversed.
          </p>
          <p>
            ${button({
              text: 'Clear Database & exit',
              style: 'filled-red',
              cls: 'fr ml3',
              click: clearDatabase
            })}
            ${button({
              text: 'Delete All Data & exit',
              style: 'filled-red',
              cls: 'fr ml3',
              click: deleteData
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
    const dbLocation = path.join(process.env.HOME, '.dat-desktop')
    const dbFile = path.join(dbLocation, 'dats.json')
    fs.unlink(dbFile, onexit)
  }
}
