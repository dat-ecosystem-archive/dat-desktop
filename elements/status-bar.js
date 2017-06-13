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
    height: 2rem;
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
        <span>Download: ${bytes(down)}/s</span>
        <span>Upload: ${bytes(up)}/s</span>
      </div>  
    `
  }
}
