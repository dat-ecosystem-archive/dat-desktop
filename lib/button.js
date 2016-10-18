'use strict'

const yo = require('yo-yo')
const css = require('yo-css')
const icon = require('./icon')

module.exports = (props, click) => {
  const style = {
    border: 0,
    backgroundColor: 'transparent',
    textTransform: 'uppercase',
    color: 'inherit'
  }
  if (typeof click === 'function') props.click = click

  var child
  if (props.icon) {
    child = yo`
    <div class="btn__icon-wrapper">
      ${icon({
        id: props.icon
      })}
      <span class="btn__icon-text">${props.text}</span>
    </div>`
  } else {
    child = props.text
  }

  return yo`
    <button onclick=${props.click} style=${css(style, props.style)} class=${props.klass || ''}>
      ${child}
    </button>
  `
}
