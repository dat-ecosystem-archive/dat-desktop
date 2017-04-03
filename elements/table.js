var cache = require('cache-element')
var html = require('choo/html')
var css = require('sheetify')

var row = require('./table-row')

var tableStyles = css`
  :host {
    width: 100%;
    th,
    td {
      padding-right: .75rem;
      padding-left: .75rem;
      font-size: .875rem;
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

module.exports = tableElement

function tableElement (state, emit) {
  var dats = state.repos.values
  return html`
    <main>
      <table class="w-100 collapse ${tableStyles}">
        ${tableHead.render()}
        <tbody>
          ${dats.map(function (dat) {
            return row(dat, state, emit)
          })}
        </tbody>
      </table>
    </main>
  `
}

function TableHead () {
  return cache(html`
    <thead>
      <tr>
        <th class="cell-1"></th>
        <th class="tl cell-2">Link</th>
        <th class="tl cell-3">Status</th>
        <th class="tr cell-4">Size</th>
        <th class="tl cell-5">Peers</th>
        <th class="cell-6"></th>
      </tr>
    </thead>
  `)
}
