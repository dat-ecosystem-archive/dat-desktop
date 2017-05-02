'use strict'

var html = require('choo/html')
var assert = require('assert')
var css = require('sheetify')
var xtend = require('xtend')

var baseStyles = css`
  :host {
    text-transform: uppercase;
    letter-spacing: .025em;
    cursor: pointer;
    background-color: transparent;
  }

  :host .btn-inner-wrapper {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: center;
    align-items: center;
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
  :host :hover,
  :host :focus {
    background-color: var(--color-red-hover);
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
module.exports = plainButton

// States:
// - Text only
// - Text and icon
function buttonElement (innerText, opts) {
  if (typeof innerText === 'object') {
    opts = innerText
    innerText = ''
  }

  assert.equal(typeof innerText, 'string', 'elements/button: innerText should be type string')
  assert.equal(typeof opts, 'object', 'elements/button: opts should be type object')

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

  var el = html`
    <button>
      ${innerHTML}
    </button>
  `

  copyProps(el, buttonProps)
  return el
}

// - Icon only
function iconButton (innerText, opts) {
  assert.equal(typeof innerText, 'string', 'elements/button.icon: innerText should by type string')
  assert.ok(innerText.length, 'elements/button.icon: innerText should have a length >= 0')
  assert.equal(typeof opts, 'object', 'elements/button.icon: opts should by type object')
  assert.ok(opts.icon, 'elements/button.icon: opts.icon should exist')

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

  var el = html`
    <button>
      ${innerHTML}
    </button>
  `
  copyProps(el, buttonProps)
  return el
}

function greenButton (innerText, opts) {
  if (typeof innerText === 'object') {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}

  assert.equal(typeof innerText, 'string', 'elements/button.green: innerText should be type string')
  assert.equal(typeof opts, 'object', 'elements/button.green: opts should be type object')

  opts.class = (opts.class) ? greenStyles + ' ' + opts.class : greenStyles
  return buttonElement(innerText, opts)
}

function redButton (innerText, opts) {
  if (typeof innerText === 'object') {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}

  assert.equal(typeof innerText, 'string', 'elements/button.red: innerText should be type string')
  assert.equal(typeof opts, 'object', 'elements/button.red: opts should be type object')

  opts.class = (opts.class) ? redStyles + ' ' + opts.class : redStyles
  return buttonElement(innerText, opts)
}

function plainButton (innerText, opts) {
  if (typeof innerText === 'object') {
    opts = innerText
    innerText = ''
  }

  opts = opts || {}

  assert.equal(typeof innerText, 'string', 'elements/button: innerText should be type string')
  assert.equal(typeof opts, 'object', 'elements/button: opts should be type object')

  opts.class = (opts.class) ? plainStyles + ' ' + opts.class : plainStyles
  return buttonElement(innerText, opts)
}

function copyProps (el, props) {
  Object.keys(props).forEach(function (key) {
    el.setAttribute(key, props[key])
  })
}
