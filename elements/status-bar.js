'use strict'

const Nanocomponent = require('nanocomponent')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')

module.exports = StatusBar

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

function StatusBar () {
  if (!(this instanceof StatusBar)) return new StatusBar()
  Nanocomponent.call(this)
}

StatusBar.prototype = Object.create(Nanocomponent.prototype)

StatusBar.prototype.createElement = function (props) {
  const { up, down } = props
  return html`
      <div id="status-bar" class=${style}>
        <span class="f7 mr3">Download: ${bytes(down)}/s</span>
        <span class="f7">Upload: ${bytes(up)}/s</span>
      </div>
    `
}

StatusBar.prototype.update = function () {
  return
}
