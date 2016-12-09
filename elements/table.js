const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')

const button = require('./button')
const icon = require('./icon')

css('dat-colors')

const table = css`

  :host {
    width: 100%;
  }
  th, td {
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
  }
  th:first-child {
    width: 3rem;
    padding: 0;
    border: none;
  }
  th:last-child {
    width: 8.25rem;
  }
  tr td {
    height: 4rem;
    vertical-align: middle;
    padding-top: 1rem;
  }
  tr:hover td {
  background-color: var(--color-neutral--04);
  }
  .cell-1 {
    width: 5rem;
  }
  .cell-2 {
    width: 17rem;
  }
  .cell-3 {
    width: 15rem;
  }
  .cell-4 {
    width: 5.5rem;
  }
  .cell-5 {
    width: 6rem;
  }
  .cell-6 {
    width: 10.25rem;
  }
  .cell-truncate {
    width: 26vw;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row-action {
    height: 2rem;
    display: inline-block;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: inherit;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: .025em;
    color: var(--color-neutral-20);
  }
  .row-action svg {
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
  .row-action:hover,
  .row-action:focus {
    outline: none;
    color: var(--color-neutral-50);
  }
  .row-action:first-child {
    padding-left: 0;
  }
  .row-action:last-child {
    padding-right: 0;
  }
  .icon-network {
    color: var(--color-neutral-20);
    vertical-align: middle;
    width: 1.1em;
    max-height: 1.6em;
  }
`

module.exports = tableElement

function tableElement (dats, send) {
  return html`
    <table class="w-100 collapse ${table}">
      <thead>
        <tr>
          <th class="cell-1"></th>
          <th class="tl cell-2">Link</th>
          <th class="tl cell-3">Download</th>
          <th class="tr cell-4">Size</th>
          <th class="tr cell-5">Network</th>
          <th class="cell-6"></th>
        </tr>
      </thead>
      <tbody>
        ${createTable(dats, send)}
      </tbody>
    </table>
  `
}

// create the inner table element
// ([obj], fn) -> html
function createTable (dats, send) {
  return dats.map(dat => {
    const stats = dat.hyperStats && dat.hyperStats.get()
    const progress = stats
      ? stats.blocksTotal
        ? Math.round(((stats.blocksProgress / stats.blocksTotal) | 0) * 100)
        : 100
      : 0

    const state = progress < 1
      ? dat.stats.peers > 0
        ? 'loading'
        : 'paused'
      : 'complete'

    const hexContent = {
      loading: icon({id: 'hexagon-down', cls: 'color-info'}),
      paused: icon({id: 'hexagon-pause', cls: 'color-neutral-30'}),
      complete: icon({id: 'hexagon-up', cls: 'color-green'})
    }[state]

    return html`
      <tr>
        <td class="cell-1">
          <div class="w2 pa1 center">
            ${hexContent}
          </div>
        </td>
        <td class="cell-2">
          <div class="cell-truncate">
            ${dat.title || `#${encoding.encode(dat.key)}`}
            <br />
            <span class="f7">
              ${dat.owner
                ? 'Read & Write'
                : 'Read-only'}
              ${dat.title && `· #${encoding.encode(dat.key)}`}
            </span>
          </div>
        </td>
        <td class="cell-3">
          <div class="progress">
            <div class="progress__counter">
              ${progress}%
            </div>
            <div class="progress__bar">
              <div
                class="progress__line progress__line--${state}"
                style="width: ${progress}%"
              ></div>
            </div>
          </div>
        </td>
        <td class="tr cell-4">
          ${bytes(dat.stats.bytesTotal)}
        </td>
        <td class="tr cell-5">
          ${icon({
            id: 'network'
          })}
          ${dat.stats.peers}
        </td>
        <td class="cell-6">
          <div class="flex justify-end">
            ${button({
              icon: 'open-in-finder',
              text: '',
              cls: 'row-action',
              click: () => send('app:open', dat)
            })}
            ${button({
              icon: 'link',
              text: '',
              cls: 'row-action',
              click: () => send('app:share', dat)
            })}
            ${button({
              icon: 'delete',
              text: '',
              cls: 'row-action',
              click: () => send('app:delete', dat)
            })}
          </div>
        </td>
      </tr>
    `
  })
}
