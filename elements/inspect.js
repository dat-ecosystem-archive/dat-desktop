'use strict'

var microcomponent = require('microcomponent')
var dialog = require('electron').remote.dialog
var bytes = require('prettier-bytes')
var html = require('choo/html')
var css = require('sheetify')
var icon = require('./icon')
var button = require('./button')

var detailHeader = css`
  :host {
    height: 4rem;
    border-bottom: 1px solid var(--color-neutral-20);
  }
`

module.exports = function () {
  var component = microcomponent('inspect')
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { oncancel, dat } = this.props

    var title = dat
      ? dat.metadata
        ? dat.metadata.title
        : key
      : 'Fetching metadata …'
    var author = dat
      ? dat.metadata
        ? dat.metadata.author
        : 'Anonymous'
      : '…'
    var description = dat
      ? dat.metadata
        ? dat.metadata.description
        : 'N/A'
      : '…'
    var size = dat
      ? dat.archive.content
        ? bytes(dat.archive.content.byteLength)
        : 'N/A'
      : '…'
    var peers = dat
      ? dat.network.connected
      : '…'

    return html`
      <main class="flex flex-column">
        <div class="flex flex-column flex-auto">
          <header class="flex items-center ${detailHeader}">
            <div class="w3">
              ${icon('hexagon-down', {class: 'w2 center color-neutral-30'})}
            </div>
            <h2 class="f5 normal truncate pr3 w-90">
              ${title}
            </h2>
          </header>
          <div class="flex-auto pv3 ph5 bg-neutral-04">
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Link:
              </div>
              <div class="is-selectable f7 mb2 mw6 truncate">
                ${dat.key}
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Size:
              </div>
              <div class="is-selectable f7 mb2 mw6">
                ${size}
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Peers:
              </div>
              <div class="is-selectable f7 mb2 mw6">
                ${peers}
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Author:
              </div>
              <div class="is-selectable f7 mb2 mw6">
                ${author}
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Description:
              </div>
              <div class="is-selectable f7 mb2 mw6 h4">
                ${description}
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Download to:
              </div>
              <div class="flex flex-auto items-center justify-between bg-white mb2 mw6">
                <pre class="flex-auto color-neutral-60 ph2 is-selectable f7">
                  ${dat.path}
                </pre>
              </div>
            </div>
            <div class="flex">
              <div class="f7 w4 color-neutral-60">
                Files:
              </div>
              <div class="flex-auto bg-white mb2 pa2 mw6">
                <p class="tc f7 color-pink">
                  [[[ list of files goes here ]]]
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    `
  }

  function update (props) {
    return true
  }
}
