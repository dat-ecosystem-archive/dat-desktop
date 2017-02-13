const html = require('choo/html')

const CrashModal = require('../elements/error-modal')
const Header = require('../elements/header')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')

var Modal = CrashModal()

module.exports = view

function view (state, prev, send) {
  const archives = state.repos.values
  const isReady = state.repos.ready
  const message = state.error.message

  const header = Header({
    isReady: isReady,
    oncreate: () => send('repos:create'),
    onimport: (link) => send('repos:clone', link)
  })

  var modal = Modal(message, function () {
    send('error:clear')
    window.history.back()
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
