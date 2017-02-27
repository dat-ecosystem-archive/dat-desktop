const Modal = require('base-elements/modal')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const button = require('./newButton')
const icon = require('./newIcon')

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
      class: 'fr ml3',
      onclick: ondelete
    })

    var exitButton = button('No, Cancel', {
      class: 'fr',
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
