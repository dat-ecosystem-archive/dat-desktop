const html = require('choo/html')

const ConfirmModal = require('../elements/confirm-modal')
const Header = require('../elements/header')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')

const confirmModal = ConfirmModal()

module.exports = view

function view (state, prev, send) {
  const link = state.location.search.delete
  const archives = state.repos.values

  const header = Header({
    create: () => send('repos:create'),
    download: (link) => send('repos:download', link)
  })

  return html`
    <body>
      ${sprite()}
      ${header}
      ${Table(archives, send)}
      ${confirmModal(() => send('repos:deleteConfirm', link))}
    </body>
  `
}
