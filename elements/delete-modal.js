const widget = require('cache-element/widget')
const icon = require('./icon')
const button = require('./button')
const Modal = require('../lib/modal-element')
const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
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
    render: function (onOk) {
      console.log('onOk', onOk)
      const modal = Modal(null, { onexit: onExit })

      modal.show(render(onOk, onExit))

      return modal

      function onExit () {
        window.history.back()
      }
    }
  })

  function render (onOk, onExit) {
    return html`
      <section class="relative flex flex-column justify-center ${prefix}">
        <h3 class="f4">Remove Dat</h3>
        <p class="mt3 mb4 f7 color-neutral-70">
          Are you sure you want to remove this dat?
          <br>
          This can’t be undone.
        </p>
        <p>
          ${button({
            text: 'Yes, Remove Dat',
            style: 'filled-green',
            cls: 'fr ml3',
            click: onOk
          })}
          ${button({
            text: 'No, Cancel',
            style: 'plain',
            cls: 'fr',
            click: onExit
          })}
        </p>
        <button
          onclick=${onExit}
          class="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
          aria-label="Close">
          ${icon({id: 'cross'})}
        </button>
      </section>`
  }
}
