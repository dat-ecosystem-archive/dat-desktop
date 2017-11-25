'use strict'

var microcomponent = require('microcomponent')
var dialog = require('electron').remote.dialog
var bytes = require('prettier-bytes')
var FileList = require('./file-list')
var html = require('choo/html')
var css = require('sheetify')
var icon = require('./icon')
var button = require('./button')
var os = require('os')

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

module.exports = function () {
  var component = microcomponent({
    name: 'download',
    state: {
      fileList: FileList()
    }
  })
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { key, oncancel, err, dat, ondownload, onupdate } = this.props
    var { fileList } = this.state
    var location = this.state.location || `${os.homedir()}/Downloads`

    var title = dat
      ? dat.metadata
        ? dat.metadata.title
        : key
      : 'Fetching metadata …'
    var author = dat
      ? dat.metadata
        ? dat.metadata.author
        : 'N/A'
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

    function onChangeLocation () {
      var files = dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: location
      })
      if (!files || !files.length) return
      component.state.location = files[0]
      onupdate()
    }

    return html`
      <main class="flex flex-column">
      ${err
        ? html`
            <p class="color-red">There was an error: ${err.message}</p>
          `
        : html`
            <div class="flex flex-column flex-auto">
              <header class="flex items-center ${detailHeader}">
                <div class="w3">
                  ${icon('hexagon-down', {class: 'w2 center color-neutral-30'})}
                </div>
                <h2 class="f5 normal truncate pr3 w-90">
                  ${title}
                </h2>
              </header>
              <div class="flex-auto pa3 pl5 bg-neutral-04 overflow-y-auto">
                <div class="flex">
                  <div class="mb2 ${label}">
                    Link:
                  </div>
                  <div class="is-selectable f7 f6-l mb2 mw6 truncate">
                    ${key}
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
                  <div class="mb2 mb2 ${label}">
                    Download to:
                  </div>
                  <div class="flex flex-auto items-center justify-between bg-white mb2 mw6">
                    <pre class="flex-auto ph2 is-selectable truncate f7 f6-l">
                      ${location}
                    </pre>
                    ${button('Change…', {
                      class: '',
                      onclick: onChangeLocation
                    })}
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
          `
        }
        <footer class="pa3 flex items-center justify-between bg-white ${detailFooter}">
          <p class="truncate">Download this Dat now?</p>
          <div class="flex ml2">
            ${button.green('Download', {
              onclick: () => ondownload({ key, location })
            })}
            ${button('Cancel', {
              onclick: oncancel
            })}
          </div>
        </footer>
      </main>
    `
  }

  function update (props) {
    return true
  }
}
