const clipboard = require('electron').clipboard
const widget = require('cache-element/widget')
const Modal = require('../lib/modal-element')
const icon = require('./icon')
const html = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    --input-height: 2rem;
    --icon-height: 1.2rem;
    --button-width: 2rem;
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
  }
  :host .dat-input {
    height: var(--input-height);
    border: 0;
  }
  :host .dat-input-button {
    width: var(--button-width);
    height: calc(var(--input-height) - 2px);
    top: 1px;
    right: 1px;
    bottom: 1px;
    background-color: var(--color-neutral-10);
    border: none;
    color: var(--color-neutral-30);
  }
  :host .dat-input-button:hover,
  :host .dat-input-button:focus {
    outline: none;
    color: var(--color-green-hover);
  }
  :host .icon-link,
  :host .icon-clipboard {
    position: absolute;
    top: 0;
    bottom: 0;
    padding-top: .4rem;
    padding-left: .5rem;
    pointer-events: none;
    display: block;
    width: var(--icon-height);
    height: var(--icon-height);
  }
  :host .icon-link {
    left: 0;
    color: var(--color-neutral-30);
  }
  :host .icon-clipboard {
    right: .3rem;
  }
  :host .dat-input-input {
    width: 100%;
    height: 2rem;
    padding-right: calc(var(--button-width) + .25rem);
    padding-left: 2rem;
    font-size: .875rem;
    border: 1px solid var(--color-neutral-30);
    background-color: var(--color-white);
    color: var(--color-green-hover);
  }
  :host .dat-input-input:hover,
  :host .dat-input-input:focus {
    outline: none;
  }
  :host .dat-input-check {
    color: var(--color-blue);
    top: 2rem;
  }
  :host .icon-check {
    width: var(--icon-height);
    height: .875rem;
    vertical-align: -.15rem;
  }
  :host .confirmation {
    right: 0;
    opacity: 0;
    top: -.5rem;
  }
  :host .show-confirmation {
    top: -1.2rem;
    opacity: 1;
    transition: all .15s ease-out;
  }
`

module.exports = createWidget

function createWidget () {
  return widget({
    render: function (newLink) {
      const modal = Modal(null, { onexit: onExit })

      var link = 'dat://' + newLink
      modal.show(render(link, false, onCopy, onExit))

      return modal

      function onCopy () {
        clipboard.writeText(link)
        modal.show(render(link, true, onCopy, onExit))
      }

      function onExit () {
        window.history.back()
      }
    }
  })

  function render (link, isCopied, onCopy, onExit) {
    const confirmClass = (isCopied) ? 'show-confirmation' : ''

    return html`
      <section class="${prefix} relative flex flex-column justify-center pa3 ph4 bg-white">
        <h3 class="mt0">Copy Dat Link</h3>
        <label for="dat-link" class="relative dat-input">
          <p class="f7 mt0 mb0 tr absolute color-blue confirmation ${confirmClass}">
            ${icon({id: 'check'})}
            Link copied to clipboard
          </p>
          <input
            name="dat-link"
            type="text"
            value=${link}
            class="relative dib pa0 dat-input-input">
          ${icon({id: 'link'})}
          <button class="absolute pointer dat-input-button" onclick=${onCopy}>
            ${icon({id: 'clipboard'})}
          </button>
        </label>
        <p class="f7">
          Anyone with this link can view your Dat.
        </p>
        <button
          onclick=${onExit}
          class="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
          aria-label="Close">
          ${icon({id: 'cross'})}
        </button>
      </section>
    `
  }
}
