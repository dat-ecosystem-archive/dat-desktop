'use strict'

const encoding = require('dat-encoding')
const icon = require('./icon')
const yo = require('choo/html')
const css = require('sheetify')

const prefix = css`
  :host {
    --icon-height: 1.2rem;
    color: var(--color-neutral-30);
  }

  :host .icon-link {
    padding-top: .32rem;
    padding-left: .5rem;
    pointer-events: none;
    width: var(--icon-height);
    height: var(--icon-height);
  }
  :host input {
    height: 1.75rem;
    width: 6.75rem;
    padding-right: .5rem;
    padding-left: 2rem;
    font-size: .75rem;
    border: 1px solid transparent;
    background-color: transparent;
    color: var(--color-neutral-30);
    opacity: 1;
    text-transform: uppercase;
    letter-spacing: .025em;
    transition-property: width;
    transition-duration: .15s;
    transition-timing-function: ease-in;
  }
  :host input::-webkit-input-placeholder {
    color: var(--color-neutral-30);
    opacity: 1;
  }
  :host input:hover,
  :host input:hover::-webkit-input-placeholder,
  :host input:hover + svg {
    color: var(--color-white);
  }
  :host input:focus,
  :host input:active {
    width: 14rem;
    outline: none;
    background-color: var(--color-white);
    color: var(--color-neutral);
  }
  :host input:focus::-webkit-input-placeholder,
  :host input:active::-webkit-input-placeholder,
  :host input:focus + svg,
  :host input:active + svg {
    color: var(--color-neutral-50);
  }
`

module.exports = (props) => {
  const keydown = (e) => {
    if (e.keyCode === 13) {
      const link = e.target.value
      try {
        encoding.decode(link)
      } catch (err) {
        throw new Error('Invalid link')
      }
      e.target.value = ''
      props.download(link)
    }
  }
  return yo`
    <label for="dat-import" class="relative dib pa0 b--none  ${prefix}">
      <input name="dat-import" type="text" placeholder="Import dat" onkeydown=${keydown} class="input-reset">
      ${icon({
        id: 'link',
        cls: 'absolute top-0 bottom-0 left-0'
      })}
    </label>
  `
}
