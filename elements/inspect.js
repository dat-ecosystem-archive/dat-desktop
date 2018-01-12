'use strict'

var Nanocomponent = require('nanocomponent')
var toStr = require('dat-encoding').toStr
var bytes = require('prettier-bytes')
var FileList = require('./file-list')
var button = require('./button')
var html = require('choo/html')
var css = require('sheetify')
var icon = require('./icon')

module.exports = Inspect

var detailHeader = css`
  :host {
    height: 4rem;
    flex-shrink: 0;
    border-bottom: 1px solid var(--color-neutral-20);
  }
`

var detailFooter = css`
  :host {
    flex-shrink: 0;
    border-top: 1px solid var(--color-neutral-20);
  }
`

var label = css`
  :host {
    font-size: .75rem;
    min-width: 8rem;
    color: var(--color-neutral-60);
  }
`

function Inspect () {
  if (!(this instanceof Inspect)) return new Inspect()
  Nanocomponent.call(this)
  this.state = {
    fileList: FileList()
  }
}

Inspect.prototype = Object.create(Nanocomponent.prototype)

Inspect.prototype.createElement = function (props) {
  var { oncancel, onupdate, dat } = props
  var { fileList } = this.state

  var title = dat
      ? dat.metadata
        ? dat.metadata.title
        : dat.key
      : 'Fetching metadata …'
  var author = dat
      ? dat.metadata
        ? dat.metadata.author
        : 'N/A'
      : '…'
  var description = dat
      ? dat.metadata && dat.metadata.description
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
          <di class="flex-auto pa3 pl5 bg-neutral-04 overflow-y-auto">
            <div class="flex">
              <div class="mb2 ${label}">
                Link:
              </div>
              <div class="is-selectable f7 f6-l mb2 mw6 truncate">
                ${toStr(dat.key)}
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Size:
              </div>
              <div class="is-selectable f7 f6-l mb2 mw6">
                ${size}
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Peers:
              </div>
              <div class="is-selectable f7 f6-l mb2 mw6">
                ${peers}
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Author:
              </div>
              <div class="is-selectable f7 f6-l mb2 mw6">
                ${author}
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Description:
              </div>
              <div class="is-selectable f7 f6-l mb2 mw6">
                ${description}
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Download to:
              </div>
              <div class="flex flex-auto items-center justify-between bg-white mb2 mw6">
                <pre class="flex-auto ph2 is-selectable truncate f7 f6-l">
                  ${dat.path}
                </pre>
              </div>
            </div>
            <div class="flex">
              <div class="mb2 ${label}">
                Files:
              </div>
              ${fileList.render({ dat, onupdate })}
            </div>
          </div>
        </div>
        <footer class="pa3 flex items-center justify-between bg-white ${detailFooter}">
          <div class="flex ml2">
            ${button('← Back to Overview', {
              onclick: oncancel
            })}
          </div>
        </footer>
      </main>
    `
}

Inspect.prototype.update = function (props) {
  return true
}

