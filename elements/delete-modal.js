const widget = require('cache-element/widget')
const icon = require('./icon')
const Modal = require('../lib/modal-element')
const html = require('choo/html')

module.exports = createWidget

function createWidget () {
  return widget({
    render: function (onOk) {
      const modal = Modal(null, { onexit: onExit })

      modal.show(render(onOk, onExit))

      return modal

      function onExit () {
        window.history.back()
      }
    }
  })

  function render (onOk, onExit) {
    return html`
      <section class="relative flex flex-column justify-center">
        <h3 class="f4">Are you sure you want to delete this dat?</h3>
        <button class="pointer dat-input-button" onclick=${onOk}>Yes</button>
        <button onclick=${onExit}>No</button>
        <button
          onclick=${onExit}
          class="absolute pointer pa0 top-0 right-0 h2 w2 bg-transparent tc exit"
          aria-label="Close">
          ${icon({id: 'cross'})}
        </button>
      </section>`
  }
}
