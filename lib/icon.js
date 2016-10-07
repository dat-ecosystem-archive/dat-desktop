'use strict'

const yo = require('yo-yo')
const css = require('yo-css')

module.exports = (props) => {
  const style = {
    maxWidth: '30px'
  }

  return yo`
    <svg viewBox="0 0 16 16" style=${css(style, props.style)} class="icon icon-${props.id}">
      <use xlink:href="#daticon-${props.id}" />
    </svg>
  `
}
