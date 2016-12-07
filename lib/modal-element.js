var document = require('global/document')
var update = require('yo-yo').update
var onload = require('on-load')
var assert = require('assert')
var css = require('sheetify')
var html = require('yo-yo')

var prefix = css`
  :host {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
    background-color: rgba(41,54,72,.8);
  }
`

module.exports = function modalElement (contents, handleExit) {
  handleExit = handleExit || noop

  assert.ok(contents, 'modal-element: contents should exist')
  assert.equal(typeof handleExit, 'function', 'modal-element: handleExit  should be a function')

  var el = render(contents)

  onload(el, function () {
    document.body.addEventListener('mousedown', didClickOut, false)
    document.body.addEventListener('keydown', pressedEscape, false)
  }, function () {
    document.body.removeEventListener('mousedown', didClickOut, false)
    document.body.removeEventListener('keydown', pressedEscape, false)
  })

  el.toggle = modalToggle
  el.show = modalShow
  el.hide = modalHide

  return el

  function render (contents) {
    return html`
      <div class="${prefix} modal-overlay">
        ${contents}
      </div>
    `
  }

  function modalShow (newContents) {
    if (newContents) contents = newContents
    el = update(el, render(contents))
  }

  function modalHide () {
    var inner = html`<div class="modal-overlay-disabled"></div>`
    update(el, inner)
  }

  function modalToggle (newContents) {
    if (!el || el.nodeName === '#text') modalShow(newContents)
    else modalHide()
  }

  function didClickOut (e) {
    var source = e.target
    while (source.parentNode) {
      if (source === el) return true
      source = source.parentNode
    }
    modalHide()
    if (handleExit) handleExit()
  }

  function pressedEscape (e) {
    if (e.key !== 'Escape') return
    modalHide()
    if (handleExit) handleExit()
  }
}

function noop () {}
