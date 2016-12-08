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

module.exports = function modalElement (content, handlers) {
  content = content || html`<div data-placeholder=true></div>`
  handlers = handlers || {}

  assert.equal(typeof content, 'object', 'modal-element: content should be an object')
  assert.equal(typeof handlers, 'object', 'modal-element: handlers should be an object')

  var el = render(content)
  var _onunload = handlers.onunload || noop
  var _onload = handlers.onload || noop
  var _onexit = handlers.onexit || noop

  onload(el, function () {
    document.body.addEventListener('mousedown', clickedOutside, false)
    document.body.addEventListener('keydown', pressedEscape, false)
    _onload()
  }, function () {
    document.body.removeEventListener('mousedown', clickedOutside, false)
    document.body.removeEventListener('keydown', pressedEscape, false)
    _onunload()
  })

  el.toggle = modalToggle
  el.show = modalShow
  el.hide = modalHide

  return el

  function render (content) {
    return html`
      <div class="${prefix} modal-overlay">
        ${content}
      </div>
    `
  }

  function modalShow (newContent) {
    if (newContent) content = newContent
    el = update(el, render(content))
  }

  function modalHide () {
    var inner = html`<div class="modal-overlay-disabled"></div>`
    update(el, inner)
    _onexit()
  }

  function modalToggle (newContent) {
    if (!el || el.nodeName === '#text') modalShow(newContent)
    else modalHide()
  }

  function clickedOutside (e) {
    var source = e.target
    while (source.parentNode) {
      if (source === el) return true
      source = source.parentNode
    }
    modalHide()
  }

  function pressedEscape (e) {
    if (e.key !== 'Escape') return
    modalHide()
    _onunload()
  }
}

function noop () {}
