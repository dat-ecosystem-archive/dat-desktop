'use strict'

const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

var prefix = css`
  :host {
    display: block;
    fill: currentColor;
  }
`

module.exports = iconElement

function iconElement (iconName, opts) {
  opts = opts || {}

  assert.equal(typeof iconName, 'string', 'elements/icon: iconName should be type string')
  assert.equal(typeof opts, 'object', 'elements/icon: opts should be type object')

  var classNames = 'icon-' + iconName + ' ' + prefix
  if (opts.class) classNames += (' ' + opts.class)

  return html`
    <svg viewBox="0 0 16 16" class=${classNames}>
      <use xlink:href="#daticon-${iconName}" />
    </svg>
  `
}
