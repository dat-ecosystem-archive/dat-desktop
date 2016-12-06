const widget = require('cache-element/widget')
const Modal = require('../lib/modal-element')
const html = require('choo/html')
var css = require('sheetify')

css('dat-colors')

var prefix = css`
  :host {
    --input-height: 2rem;
    --icon-height: 1.2rem;
    --button-width: 2rem;
    box-shadow: 0 1.2rem 2.4rem rgba(0,0,0,.5);
    position: relative;
  }
  .exit {
    width: 2rem;
    height: 2rem;
    padding: 0;
    position: absolute;
    top: 0;
    right: 0;
    background: transparent;
    border: none;
    text-align: center;
    color: var(--color-neutral-40);
  }
  .exit:hover, .exit:focus {
    color: var(--color-neutral);
  }
  .exit-svg {
    fill: currentColor;
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
  .dat-input {
    height: var(--input-height);
    position: relative;
    display: inline-block;
    padding: 0;
    border: 0;
  }
  .dat-input-button {
    width: var(--button-width);
    height: calc(var(--input-height) - 2px);
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    background-color: var(--color-neutral-10);
    border: none;
    cursor: pointer;
  }
  .dat-input-svg,
  .dat-input-button-svg {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    padding-top: .4rem;
    padding-left: .5rem;
    pointer-events: none;
    display: block;
    width: var(--icon-height);
    height: var(--icon-height);
    fill: var(--color-neutral-30);
  }
  .dat-input-button-svg {
    left: auto;
    right: 0;
  }
  .modal-input {
    height: 2rem;
    padding-right: calc(var(--button-width) + .25rem);
    padding-left: 2rem;
    font-size: .875rem;
    border: 1px solid var(--color-neutral-30);
    background-color: transparent;
    color: var(--color-green-hover);
  }
  .modal-input:hover,
  .modal-input:focus {
    outline: none;
    border-color: var(--color-info-hover);
  }
`

module.exports = createWidget

function createWidget () {
  let link = null

  let modal = Modal(html`<div></div>`, () => {
    link = null
  })

  return widget({
    onload: function () {
      if (link) modal.show(createHtml(link))
    },
    onunload: function () {
      link = null
      modal.hide()
    },
    onupdate: function (el, newLink) {
      if (!link && newLink) {
        // fresh link
        link = newLink
        modal.show(createHtml(link))
      } else if (!newLink) {
        // link was cleared
        link = null
        modal.hide()
      } else if (newLink && (link !== newLink)) {
        // ohey, we moved to a different link
        link = newLink
        modal.show(createHtml(link))
      }
    },
    render: function (newLink) {
      link = newLink
      if (link) {
        modal.show(createHtml(link))
      } else {
        modal.hide()
      }

      return html`<div>${modal}</div>` // this fixes a bug in modal-element
    }
  })

  function createHtml (link) {
    return html`
      <section class="${prefix} flex flex-column items-center justify-center pa3 bg-white">
        <h3>Copy Dat Link</h3>
        <label for="dat-link" class="dat-input">
          <input name="dat-link" type="text" value=${link} class="modal-input">
          <svg class="dat-input-svg">
            <use xlink:href="#daticon-link" />
          </svg>
          <button class="dat-input-button">
            <svg class="dat-input-button-svg">
              <use xlink:href="#daticon-clipboard" />
            </svg>
          </button>
        </label>
        <p class="f7">
          Anyone with this link can view your Dat.
        </p>
        <button onclick=${handleExit} class="pointer exit" aria-label="Close">
          <svg class="exit-svg">
            <use xlink:href="#daticon-cross" />
          </svg>
        </button>
      </section>
    `

    function handleExit () {
      link = null
      modal.hide()
      window.history.back()
    }
  }
}
