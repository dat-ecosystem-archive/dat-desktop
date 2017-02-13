const html = require('choo/html')

const Modal = require('../elements/crash-modal')
const Header = require('../elements/header')
const sprite = require('../elements/sprite')
const Table = require('../elements/table')

var modal = Modal()

module.exports = view

function view (state, prev, send) {
  const archives = state.repos.values
  const ready = state.repos.ready

  const header = Header({
    ready: ready,
    create: () => send('repos:create'),
    download: (link) => send('repos:clone', link)
  })

  return html`
    <body>
      ${sprite()}
      ${header}
      ${Table(archives, send)}
      ${modal(() => send('error:quit'))}
    </body>
  `
}
