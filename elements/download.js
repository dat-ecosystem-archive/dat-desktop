'use strict'

var microcomponent = require('microcomponent')
var html = require('choo/html')

module.exports = function () {
  var component = microcomponent('download')
  component.on('render', render)
  component.on('update', update)
  return component

  function render () {
    return html`<div></div>`
  }

  function update () {
    return false
  }
}
