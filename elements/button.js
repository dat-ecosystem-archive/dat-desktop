'use strict'

const yo = require('choo/html')
const icon = require('./icon')

module.exports = (props, click) => {
  if (typeof click === 'function') props.click = click

  var child
  if (props.icon) {
    child = yo`
    <div class="btn-wrapper">
      ${icon({
        id: props.icon
      })}
      <span class="btn-text ml1">${props.text}</span>
    </div>`
  } else {
    child = yo`
    <div class="btn-wrapper">
      <span class="btn-text">${props.text}</span>
    </div>`
  }

  return yo`
    <button onclick=${props.click} class="${props.cls || ''}">
      ${child}
    </button>
  `
}
