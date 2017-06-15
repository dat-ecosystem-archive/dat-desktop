'use strict'

const microcomponent = require('microcomponent')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')
const button = require('./button')
const icon = require('./icon')

const style = css`
  :host {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    padding: .5rem 1rem;
    background-color: var(--color-neutral-04);
    color: var(--color-neutral-60);
  }
`

module.exports = function () {
  const component = microcomponent({
    name: 'status bar',
    pure: true
  })
  component.on('render', render)
  return component

  function render () {
    const { up, down } = this.props
    return html`
      <div id="status-bar" class=${style}>
        ${button.icon('Settings', {
          icon: icon('gear', { class: 'w1' }),
          class: 'pr3 color-neutral-50 hover-color-neutral-70'
        })}
        <span class="f7 pa1 mr3">Download: ${bytes(down)}/s</span>
        <span class="f7 pa1">Upload: ${bytes(up)}/s</span>
      </div>
    `
  }
}
