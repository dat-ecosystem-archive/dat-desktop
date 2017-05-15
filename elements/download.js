'use strict'

var microcomponent = require('microcomponent')
var html = require('choo/html')

module.exports = function () {
  var component = microcomponent('download')
  component.on('render', render)
  component.on('update', update)
  return component

  function render (props) {
    return html`
      <main>
        <h1>Downloading ${props.link}</h1>
        <button onclick=${props.oncancel}>Cancel</button>
      </main>
    `
  }

  function update () {
    return false
  }
}
