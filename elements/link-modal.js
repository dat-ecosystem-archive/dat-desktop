const clipboard = require('electron').clipboard
const Modal = require('base-elements/modal')
const morph = require('nanomorph')
const html = require('choo/html')
const css = require('sheetify')
const icon = require('./icon')

const prefix = css`
  :host {
    min-width: 25rem;
    padding: 2rem 2.5rem 3rem;
    background-color: var(--color-white);
    box-shadow: 0 1.2rem 2.4rem rgba(0,0,0,.5);
    .exit {
      border: none;
      color: var(--color-neutral-40);
      &:hover,
      &:focus {
        color: var(--color-neutral);
      }
    }
    .icon-cross {
      vertical-align: middle;
      width: 1.1em;
      max-height: 1.6em;
      transition: color .025s ease-out;
    }
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
      display: inline-block;
      width: var(--icon-height);
      height: .875rem;
      vertical-align: -.15rem;
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

module.exports = createModal

function createModal () {
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
      morph(_el, el)
    }
  }
}
