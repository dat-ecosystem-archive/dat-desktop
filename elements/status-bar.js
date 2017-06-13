'use strict'

const microcomponent = require('microcomponent')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')

const style = css`
  :host {
    position: absolute;
    bottom: 0;
    width: 100%;
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
        <span class="f7 mr3">Download: ${bytes(down)}/s</span>
        <span class="f7">Upload: ${bytes(up)}/s</span>
      </div>
    `
  }
}
