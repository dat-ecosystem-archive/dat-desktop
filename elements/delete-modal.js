const widget = require('cache-element/widget')
const Modal = require('../lib/modal-element')
const html = require('choo/html')

module.exports = createWidget

function createWidget () {
  return widget({
    render: function (onOk) {
      const modal = Modal(null, { onexit: onExit })

      modal.show(render(onOk, onExit))

      function onExit () {
        window.history.back()
      }
    }
  })

  function render (onOk, onExit) {
    return html`
      <section class="relative flex flex-column justify-center">
        <h3>Are you sure you want to delete this dat?</h3>
        <button click=${onOk}>Yes</button>
        <button click=${onExit}>No</button>
      </section>`
  }
}
