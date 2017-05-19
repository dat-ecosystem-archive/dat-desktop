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

var detailFooter = css`
  :host {
    border-top: 1px solid var(--color-neutral-20);
  }
`

module.exports = function () {
  var component = microcomponent('download')
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { key, oncancel, err, dat, ondownload } = this.props
    var location = this.state.location || `${process.env.HOME}/Downloads`

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

    function onChangeLocation () {
      var files = dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: location
      })
      if (!files || !files.length) return
      component.state.location = files[0]
      component.render(component.props)
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
              <div class="flex-auto pv3 ph5 bg-neutral-04">
                <div class="flex">
                  <div class="f7 w4 color-neutral-60">
                    Link:
                  </div>
                  <div class="is-selectable f7 mb2 mw6 truncate">
                    ${key}
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
                      ${location}
                    </pre>
                    ${button('Change …', {
                      class: '',
                      onclick: onChangeLocation
                    })}
                  </div>
                </div>
                <div class="flex">
                  <div class="f7 w4 color-neutral-60">
                    Files:
                  </div>
                  <div class="flex-auto bg-white mb2 pa2 mw6">
                    <p class="tc f7 color-pink">
                      ${dat && dat.files
                        ? html`
                            <ul>
                              ${dat.files.map(file => {
                                var type = file.stat
                                  ? file.stat.isDirectory()
                                    ? 'directory'
                                    : 'file'
                                  : '?'
                                var size = file.stat && file.stat.isFile()
                                  ? ` (${bytes(file.stat.size)})`
                                  : ''
                                return html`
                                  <li>${file.path} ${size}</li>
                                `
                              })}
                            </ul>
                          `
                        : ''}
                    </p>
                  </div>
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
