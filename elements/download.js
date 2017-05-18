'use strict'

var microcomponent = require('microcomponent')
var dialog = require('electron').remote.dialog
var bytes = require('prettier-bytes')
var html = require('choo/html')
var button = require('./button')
var css = require('sheetify')

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
              <header class="${detailHeader}">
                <h2 class="f5 normal truncate pr3 w-90">
                  ${title}
                </h2>
              </header>
              <div class="flex-auto pa3 bg-neutral-04">
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Link:
                  </div>
                  <div class="is-selectable mb2 mw6 truncate">
                    ${key}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Author:
                  </div>
                  <div class="is-selectable mb2 mw6">
                    ${author}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Size:
                  </div>
                  <div class="is-selectable mb2 mw6">
                    ${size}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Peers:
                  </div>
                  <div class="is-selectable mb2 mw6">
                    ${peers}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Description:
                  </div>
                  <div class="is-selectable mb2 mw6">
                    ${description}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Download to:
                  </div>
                  <div class="flex flex-auto items-center justify-between bg-white mb2 mw6">
                    <pre class="flex-auto f7 color-neutral-60 ph2 is-selectable">
                      ${location}
                    </pre>
                    ${button('Change …', {
                      class: '',
                      onclick: onChangeLocation
                    })}
                  </div>
                </div>
                <div class="flex">
                  <div class="f6 w4 color-neutral-60">
                    Files:
                  </div>
                  <div class="flex-auto bg-white mb2 pa2 mw6">
                    [[[ list of files goes here ]]]
                  </div>
                </div>
              </div>
            </div>
          `
        }
        <footer class="pa3 flex items-center justify-between bg-white ${detailFooter}">
          <p class="truncate">Download this now?</p>
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
