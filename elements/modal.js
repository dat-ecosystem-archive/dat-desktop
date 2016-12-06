const widget = require('cache-element/widget')
const Modal = require('../lib/modal-element')
const html = require('choo/html')

module.exports = createWidget

function createWidget () {
  let link = null

  let modal = Modal(html`<div></div>`, () => {
    link = null
  })

  return widget({
    onload: function () {
      if (link) modal.show(createHtml(link))
    },
    onunload: function () {
      link = null
      modal.hide()
    },
    onupdate: function (el, newLink) {
      if (!link && newLink) {
        // fresh link
        link = newLink
        modal.show(createHtml(link))
      } else if (!newLink) {
        // link was cleared
        link = null
        modal.hide()
      } else if (newLink && (link !== newLink)) {
        // ohey, we moved to a different link
        link = newLink
        modal.show(createHtml(link))
      }
    },
    render: function (newLink) {
      link = newLink
      if (link) {
        modal.show(createHtml(link))
      } else {
        modal.hide()
      }

      return html`<div>${modal}</div>` // this fixes a bug in modal-element
    }
  })

  function createHtml (link) {
    return html`
      <section class="flex flex-column items-center justify-center pa3 b--solid bg-white">
        <h3>Your dat link:</h3>
        <input type="text" value=${link}/>
        <p>
          This link has also been copied to the clipboard for your
          convenience.
        </p>
        <button onclick=${handleExit} class="pointer">Ok cool</button>
      </section>
    `

    function handleExit () {
      link = null
      modal.hide()
      window.history.back()
    }
  }
}
