'use strict'

var microcomponent = require('microcomponent')
var dialog = require('electron').remote.dialog
var bytes = require('prettier-bytes')
var html = require('choo/html')

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
      <main>
        <h1>Downloading ${key}</h1>
        ${dat
          ? html`
              <ul>
                <li>Title: ${title}</li>
                <li>Author: ${author}</li>
                <li>Size: ${size}</li>
                <li>Peers: ${peers}</li>
              </ul>
            `
          : err
            ? html`
                <p>There was an error: ${err.message}</p>
              `
            : 'Fetching metadata...'}
        <p>
          Download to <pre>${location}</pre>
          <button onclick=${onChangeLocation}>Change</button>
        </p>
        <button onclick=${() => ondownload({ key, location })}>Download</button>
        <button onclick=${oncancel}>Cancel</button>
      </main>
    `
  }

  function update (props) {
    return true
  }
}
