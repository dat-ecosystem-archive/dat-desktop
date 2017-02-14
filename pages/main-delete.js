const html = require('choo/html')

const ConfirmModal = require('../elements/confirm-modal')
const Header = require('../elements/header')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')

const confirmModal = ConfirmModal()

module.exports = view

function view (state, prev, send) {
  const archives = state.repos.values
  const isReady = state.repos.ready

  const header = Header({
    isReady: isReady,
    oncreate: () => send('repos:create'),
    onimport: (link) => send('repos:clone', link)
  })

  // TODO: move 'key' out of closure, callback isn't being update
  // correctly yet has previously been source of not being able to delete
  // multiple dats in a row.
  var modal = confirmModal(function () {
    send('repos:remove', { confirmed: true })
  })

  return html`
    <body>
      ${sprite()}
      ${header}
      ${Table(archives, send)}
      ${modal}
    </body>
  `
}
