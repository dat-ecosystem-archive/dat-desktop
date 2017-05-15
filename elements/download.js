'use strict'

var microcomponent = require('microcomponent')
var bytes = require('prettier-bytes')
var html = require('choo/html')

module.exports = function () {
  var component = microcomponent('download')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (props) {
    var link = props.link
    var oncancel = props.oncancel
    var err = props.err
    var dat = props.dat

    if (dat) {
      var title = dat.metadata
        ? dat.metadata.title
        : link
      var author = dat.metadata
        ? dat.metadata.author
        : 'Anonymous'
      var size = dat.archive.content
        ? bytes(dat.archive.content.byteLength)
        : 'N/A'
      var peers = dat.network.connected
    }

    return html`
      <main>
        <h1>Downloading ${link}</h1>
        ${dat
          ? html`
              <ul>
                <li>Title: ${title}</li>
                <li>Author: ${author}</li>
                <li>Size: ${size}</li>
                <li>Peers: ${peers}</li>
              </ul>
            `
          : 'Fetching metadata...'}
        ${err
          ? html`
              <p>There was an error: ${err.message}</p>
            `
          : ''}
        <button onclick=${oncancel}>Cancel</button>
      </main>
    `
  }

  function update (props) {
    true
  }
}
