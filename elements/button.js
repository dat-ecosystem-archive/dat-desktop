'use strict'

const html = require('choo/html')
const css = require('sheetify')
const icon = require('./icon')

const prefix = css`
  :host {
    text-transform: uppercase;
    letter-spacing: .025em;
    .btn-wrapper {
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
  .icon-only {
    .btn-text {
      display: none;
    }
  }
  .filled-green {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: var(--color-green);
    color: var(--color-neutral-04);
  }
  .filled-green:hover,
  .filled-green:focus {
    background-color: var(--color-green-hover);
    color: var(--color-white);
  }
  .plain {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: transparent;
    color: var(--color-neutral-40);
  }
  .plain:hover,
  .plain:focus {
    color: var(--color-neutral-70);
  }
`

module.exports = (props, click) => {
  if (typeof click === 'function') props.click = click

  var child
  if (props.icon) {
    child = html`
    <div class="btn-wrapper">
      ${icon({
        id: props.icon
      })}
      <span class="btn-text ml1">${props.text}</span>
    </div>`
  } else {
    child = html`
    <div class="btn-wrapper">
      <span class="btn-text">${props.text}</span>
    </div>`
  }

  return html`
    <button
      onclick=${props.click}
      class="pointer ${prefix} ${props.style || ''} ${props.cls || ''}"
      title=${props.title || props.text}
      aria-label=${props.ariaLabel || props.text}
      >
      ${child}
    </button>
  `
}
