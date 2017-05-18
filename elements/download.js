'use strict'

var microcomponent = require('microcomponent')
var dialog = require('electron').remote.dialog
var bytes = require('prettier-bytes')
var html = require('choo/html')
var button = require('./button')

module.exports = function () {
  var component = microcomponent('download')
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    var { key, oncancel, err, dat, ondownload } = this.props
    var location = this.state.location || `${process.env.HOME}/Downloads`

    if (dat) {
      var title = dat.metadata
        ? dat.metadata.title
        : key
      var author = dat.metadata
        ? dat.metadata.author
        : 'Anonymous'
      var description = dat.metadata
        ? dat.metadata.description
        : ''
      var size = dat.archive.content
        ? bytes(dat.archive.content.byteLength)
        : 'N/A'
      var peers = dat.network.connected
    }

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
      <main class="flex flex-column bg-neutral-04">
        <div class="flex-auto pa3 bg-neutral-04">
          <h1 class="truncate mb3">Downloading ${key}</h1>
          ${dat
            ? html`
              <div>
                <h2 class="f6 normal truncate pr3 w-90">
                  ${title}
                </h2>
                <p class="f7 color-neutral-60 truncate">
                  Author: ${author}<br>
                  Size: ${size}<br>
                  Peers: ${peers}<br>
                </p>
              </div>
              `
            : err
              ? html`
                  <p class="color-red">There was an error: ${err.message}</p>
                `
              : 'Fetching metadata …'}
          <div>
            <span class="f7">Download to:</span>
            <div class="flex b1 items-center">
              <pre class="f7 color-neutral-60">${location}</pre>
              ${button('Change …', {
                class: '',
                onclick: onChangeLocation
              })}
            </div>
          </div>
        </div>
        <footer class="pa3">
          ${button.green('Start Download', {
            class: 'fr',
            onclick: () => ondownload({ key, location })
          })}
          ${button('Cancel', {
            class: 'fl',
            onclick: oncancel
          })}
        </footer>
        ${dat.files
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
      </main>
    `
  }

  function update (props) {
    return true
  }
}
