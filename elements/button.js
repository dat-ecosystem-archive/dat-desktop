'use strict'

const html = require('choo/html')
const css = require('sheetify')
const icon = require('./icon')

const prefix = css`
  :host {
    text-transform: uppercase;
    letter-spacing: .025em;
  }
  .btn-wrapper {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: center;
    align-items: center;
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
    <button onclick=${props.click} class="pointer ${prefix} ${props.cls || ''}">
      ${child}
    </button>
  `
}
