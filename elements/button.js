'use strict'

const html = require('choo/html')
const css = require('sheetify')
const xtend = require('xtend')

const iconElement = require('./icon')

const baseStyles = css`
  :host {
    text-transform: uppercase;
    letter-spacing: .025em;
    .btn-inner-wrapper {
      display: flex;
      flex-wrap: nowrap;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  }
  .icon-only {
    .btn-text { display: none }
  }
`

var greenStyles = css`
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
`

var redStyles = css`
  .filled-red {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: var(--color-red);
    color: var(--color-neutral-04);
  }
  .filled-red:hover,
  .filled-red:focus {
    background-color: var(--color-red-hover);
    color: var(--color-white);
  }
`

var plainStyles = css`
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

buttonElement.green = greenButton
buttonElement.red = redButton
module.exports = plainButton

// States:
// - Text only
// - Icon only
// - Text and icon
function buttonElement (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  var iconId = opts.icon
  var innerHTML = null

  if (innerText && !iconId) {
    innerHTML = html`
      <div class="btn-inner-wrapper">
        <span class="btn-text">${innerText}</span>
      </div>
    `
  } else if (!innerText && iconId) {
    innerHTML = html`
      <div class="btn-inner-wrapper">
        ${iconElement({ id: iconId })}
      </div>
    `
  } else {
    innerHTML = html`
      <div class="btn-inner-wrapper">
        ${iconElement({ id: iconId })}
        <span class="btn-text ml1">${innerText}</span>
      </div>
    `
  }

  var defaultProps = {
    'aria-label': opts.text,
    'title': opts.text
  }

  var buttonProps = xtend(defaultProps, opts)
  buttonProps.class = 'pointer ' + baseStyles + ' ' + buttonProps.class

  return html`
    <button ${buttonProps}>
      ${innerHTML}
    </button>
  `
}

function greenButton (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}
  opts.class = (opts.class) ? greenStyles + ' ' + opts.class : greenStyles
  return buttonElement(innerText, opts)
}

function redButton (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}
  opts.class = (opts.class) ? redStyles + ' ' + opts.class : redStyles
  return buttonElement(innerText, opts)
}

function plainButton (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}
  opts.class = (opts.class) ? plainStyles + ' ' + opts.class : plainStyles
  return buttonElement(innerText, opts)
}
