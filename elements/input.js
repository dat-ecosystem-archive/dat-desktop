'use strict'

const microcomponent = require('microcomponent')
const html = require('choo/html')
const css = require('sheetify')
const icon = require('./icon')

var baseStyles = css`
  :host {
    --input-height: 2.75rem;
    --icon-height: 1.2rem;
    height: var(--input-height);
    border: 0;
    svg {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      padding-top: calc(var(--icon-height) - .35rem);
      padding-left: .75rem;
      pointer-events: none;
      display: block;
      width: var(--icon-height);
      height: var(--icon-height);
      transition: color .025s ease-out;
      color: var(--color-neutral-30);
    }
    input {
      width: 100%;
      height: var(--input-height);
      position: relative;
      padding-top: 0;
      padding-right: .5rem;
      padding-bottom: 0;
      padding-left: 2.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: 1px solid var(--color-neutral-20);
      background-color: var(--color-white);
      color: var(--color-green-hover);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      &:hover,
      &:focus {
        outline: none;
      }
    }
  }
`

module.exports = inputElement

function inputElement (name) {
  var component = microcomponent(`input-${name}`)
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { name, type, placeholder, value, icon: inputIcon } = this.props
    var classNames = baseStyles
    if (this.props.class) classNames += ' ' + this.props.class

    return html`
      <label
        for="${name}"
        class="relative mt2 mb2 db ${classNames}">
        <input
          type="${type}"
          name="${name}"
          placeholder="${placeholder}"
          value="${value}">
        ${icon(inputIcon)}
      </label>
    `
  }

  function update () {
    return false
  }
}
