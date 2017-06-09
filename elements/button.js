'use strict'

const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')
const xtend = require('xtend')

const baseStyles = css`
  :host {
    text-transform: uppercase;
    letter-spacing: .025em;
    cursor: pointer;
    background-color: transparent;
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
  :host {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: var(--color-green);
    color: var(--color-neutral-04);
  }
  :host:hover,
  :host:focus {
    background-color: var(--color-green-hover);
    color: var(--color-white);
  }
`

var redStyles = css`
  :host {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: var(--color-red);
    color: var(--color-neutral-04);
  }
  :host:hover,
  :host:focus {
    background-color: var(--color-red-hover);
    color: var(--color-white);
  }
`

var headerStyles = css`
  :host {
    color: var(--color-neutral-30);
  }
  :host:hover,
  :host:focus {
    color: var(--color-white);
  }
`

var plainStyles = css`
  :host {
    padding: .5rem .75rem;
    font-size: .75rem;
    background-color: transparent;
    color: var(--color-neutral-40);
  }
  :host:hover,
  :host:focus {
    color: var(--color-neutral-70);
  }
`

plainButton.green = greenButton
plainButton.icon = iconButton
plainButton.red = redButton
plainButton.header = headerButton
module.exports = plainButton

// States:
// - Text only
// - Text and icon
function buttonElement (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  var icon = opts.icon
  var innerHTML = null

  if (innerText && !icon) {
    innerHTML = html`
      <div class="btn-inner-wrapper">
        <span class="btn-text">${innerText}</span>
      </div>
    `
  } else {
    innerHTML = html`
      <div class="btn-inner-wrapper">
        ${icon}
        <span class="btn-text ml1">${innerText}</span>
      </div>
    `
  }

  var defaultProps = {
    'aria-label': innerText,
    'title': innerText
  }

  var buttonProps = xtend(defaultProps, opts)
  buttonProps.class = baseStyles + ' ' + buttonProps.class

  return html`
    <button ${buttonProps}>
      ${innerHTML}
    </button>
  `
}

// - Icon only
function iconButton (innerText, opts) {
  assert.equal(typeof innerText, 'string', 'elements/button: innerText should by type string')
  assert.ok(innerText.length, 'elements/button: innerText should have a length >= 0')
  assert.equal(typeof opts, 'object', 'elements/button: opts should by type object')
  assert.ok(opts.icon, 'elements/button: opts.icon should exist')

  var icon = opts.icon
  opts.class = (opts.class)
    ? opts.class
    : ''

  var innerHTML = html`
    <div class="btn-inner-wrapper">
      ${icon}
    </div>
  `

  var defaultProps = {
    'aria-label': innerText,
    'title': innerText
  }

  var buttonProps = xtend(defaultProps, opts)
  buttonProps.class = baseStyles + ' ' + buttonProps.class
  buttonProps.icon = null

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

function headerButton (innerText, opts) {
  if (!opts) {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}
  opts.class = (opts.class) ? headerStyles + ' ' + opts.class : headerStyles
  return buttonElement(innerText, opts)
}

function plainButton (innerText, opts) {
  if (!opts && typeof innerText === 'object') {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}
  opts.class = (opts.class) ? plainStyles + ' ' + opts.class : plainStyles
  return buttonElement(innerText, opts)
}
