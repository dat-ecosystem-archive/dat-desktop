const Modal = require('base-elements/modal')
const html = require('choo/html')
const css = require('sheetify')

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
  return Modal({
    render: render
  })

  function render (message, onexit) {
    var exitButton = button({
      text: 'Ok',
      style: 'filled-green',
      cls: 'fr ml3',
      click: onexit
    })

    return html`
      <div class="relative flex flex-column justify-center ${prefix}">
        <section class="pa4">
          <h3 class="f4">Oops</h3>
          <p class="mt3 mb4 f7 color-neutral-70">
            Something went wrong there.
          </p>
          <p>
            ${exitButton}
          </p>
        </section>
      </div>
    `
  }
}
