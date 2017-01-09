const widget = require('cache-element/widget')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const Modal = require('../lib/modal-element')
const button = require('./button')

const prefix = css`
  :host {
    min-width: 20rem;
    min-width: 25rem;
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
    width: 1.1em;
    max-height: 1.6em;
    transition: color .025s ease-out;
  }
`

module.exports = createWidget

function createWidget () {
  return widget({
    render: function (deleteArchive) {
      assert.equal(typeof deleteArchive, 'function', 'elements/delete-modal: deleteArchive should be type function')

      const modal = Modal(null, { onexit: onExit })
      modal.show(render(onOk, onExit))
      return modal

      function onExit () {
        window.history.back()
      }

      function onOk () {
        deleteArchive()
        window.history.back()
      }
    }
  })

  function render (onOk, onExit) {
    return html`
      <section class="relative flex flex-column justify-center ${prefix}">
        <h3 class="f4">Unexpected issue</h3>
        <p class="mt3 mb4 f7 color-neutral-70">
          There was an unexpected issue. We will need to close the app.
          Sorry for the inconvenience and we will work to fix this ASAP.
        </p>
        <p>
          ${button({
            text: 'Close',
            style: 'filled-green',
            cls: 'fr ml3',
            click: onOk
          })}
        </p>
      </section>`
  }
}
