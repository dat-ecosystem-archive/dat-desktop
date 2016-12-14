'use strict'

const html = require('choo/html')
const css = require('yo-css')

module.exports = (props) => {
  const style = {
    fill: 'currentColor'
  }

  return html`
    <svg viewBox="0 0 16 16" style=${css(style, props.style)} class="icon-${props.id} ${props.cls}">
      <use xlink:href="#daticon-${props.id}" />
    </svg>
  `
}
