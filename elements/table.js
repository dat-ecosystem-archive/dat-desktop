var Nanocomponent = require('nanocomponent')
var nanolog = require('nanologger')
var html = require('choo/html')
var css = require('sheetify')

var TableRow = require('./table-row')
var TableHead = require('./table-head')

var tableStyles = css`
  :host {
    width: 100%;
    max-width: 80rem;
    margin: 0 auto;
    border-collapse: collapse;
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

var tableRows = TableRows()
var tableHead = TableHead()

module.exports = tableElement

function tableElement (state, emit) {
  var dats = state.dats.values
  return html`
    <main>
      <table class="${tableStyles}">
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
        return row.createElement({ dat, state, emit })
      } else {
        var highlight = !initialLoad
        var newRow = TableRow()
        elements[key] = newRow
        return newRow.createElement({ dat, state, emit, highlight })
      }
    })

    Object.keys(elements).forEach(function (key) {
      if (usedKeys.indexOf(key) === -1) elements[key] = null
    })

    initialLoad = false
    return renderedElements
  }
}
