const html = require('choo/html')

const BasicModal = require('../elements/basic-modal')
const Header = require('../elements/header')
const sprite = require('./elements/sprite')
const Table = require('../elements/table')

var basicModal = BasicModal()

module.exports = view

function view (state, prev, send) {
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
      ${basicModal(() => send('error:quit'))}
    </body>
  `
}
