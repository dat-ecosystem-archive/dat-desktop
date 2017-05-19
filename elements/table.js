var microcomponent = require('microcomponent')
var nanolog = require('nanologger')
var html = require('choo/html')
var css = require('sheetify')

var TableRow = require('./table-row')

var tableStyles = css`
  :host {
    width: 100%;
    th,
    td {
      padding-right: .75rem;
      padding-left: .75rem;
    }
    th {
      height: 4rem;
      font-size: .8125rem;
      font-weight: normal;
      color: var(--color-neutral-60);
      border-bottom: 1px solid var(--color-neutral-20);
      &:first-child {
        width: 3rem;
        padding: 0;
        border: none;
      }
      &:last-child {
        width: 8.25rem;
      }
    }
    td {
      height: 4rem;
      vertical-align: top;
      padding-top: 1rem;
    }
    tr:hover td {
      background-color: var(--color-neutral--04);
    }
  }
`

var tableHead = TableHead()
var tableRows = TableRows()

module.exports = tableElement

function tableElement (state, emit) {
  var dats = state.dats.values
  return html`
    <main>
      <table class="w-100 collapse ${tableStyles}">
        ${tableHead.render()}
        <tbody>
          ${tableRows(dats, state, emit)}
        </tbody>
      </table>
    </main>
  `
}

function TableRows () {
  var elements = {}
  var log = nanolog('table-rows')
  var initialLoad = true
  log.debug('initialized')

  return function (dats, state, emit) {
    log.debug('render', elements)
    var usedKeys = []
    var renderedElements = dats.map(function (dat) {
      var key = dat instanceof Error
        ? dat.stack
        : dat.key.toString('hex')
      var row = elements[key]
      usedKeys.push(key)
      if (row) {
        return row.render({ dat, state, emit })
      } else {
        var highlight = !initialLoad
        var newRow = TableRow({ highlight })
        elements[key] = newRow
        return newRow.render({ dat, state, emit })
      }
    })

    Object.keys(elements).forEach(function (key) {
      if (usedKeys.indexOf(key) === -1) elements[key] = null
    })

    initialLoad = false
    return renderedElements
  }
}

function TableHead () {
  return microcomponent({
    name: 'table-head',
    pure: true
  })
  .on('render', function () {
    return html`
      <thead>
        <tr>
          <th class="cell-1"></th>
          <th class="tl cell-2">Link</th>
          <th class="tl cell-3">Status</th>
          <th class="tl cell-4">Size</th>
          <th class="tl cell-5">Peers</th>
          <th class="cell-6"></th>
        </tr>
      </thead>
    `
  })
}
