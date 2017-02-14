const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const css = require('sheetify')

const status = require('./status')
const button = require('./button')
const icon = require('./icon')

const table = css`
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
      white-space: nowrap;
    }
    .cell-5 {
      width: 6rem;
    }
    .cell-6 {
      width: 10.25rem;
    }
    .cell-truncate {
      width: 26vw;
    }
    .row-action {
      height: 2rem;
      display: inline-block;
      border: 0;
      background: transparent;
      text-align: center;
      color: var(--color-neutral-20);
      svg {
        vertical-align: middle;
        width: 1.1em;
        max-height: 1.6em;
      }
      &:hover,
      &:focus {
        outline: none;
        color: var(--color-neutral-50);
      }
      &:first-child {
        padding-left: 0;
      }
      &:last-child {
        padding-right: 0;
      }
    }
    .icon-network {
      color: var(--color-neutral-20);
      vertical-align: middle;
      width: 1.1em;
      max-height: 1.6em;
    }
  }
`

module.exports = tableElement

function tableElement (dats, send) {
  return html`
    <main>
      <table class="w-100 collapse ${table}">
        <thead>
          <tr>
            <th class="cell-1"></th>
            <th class="tl cell-2">Link</th>
            <th class="tl cell-3">Status</th>
            <th class="tr cell-4">Size</th>
            <th class="tr cell-5">Network</th>
            <th class="cell-6"></th>
          </tr>
        </thead>
        <tbody>
          ${createTable(dats, send)}
        </tbody>
      </table>
    </main>
  `
}

// create the inner table element
// ([obj], fn) -> html
function createTable (dats, send) {
  return dats.map(dat => {
    const stats = dat.stats && dat.stats.get()
    var peers = dat.network.connected
    stats.progress = (!stats)
        ? 0
        : (stats.blocksTotal)
          ? Math.round((stats.blocksProgress / stats.blocksTotal) * 100)
          : 0

    stats.state = (dat.owner)
      ? 'complete'
      : (stats.progress === 100)
        ? 'complete'
        : (peers === 0)
          ? 'paused'
          : 'loading'

    const hexContent = {
      loading: icon({id: 'hexagon-down', cls: 'color-blue'}),
      paused: icon({id: 'hexagon-pause', cls: 'color-neutral-30'}),
      complete: icon({id: 'hexagon-up', cls: 'color-green'})
    }[stats.state]

    return html`
      <tr>
        <td class="cell-1">
          <div class="w2 pa1 center">
            ${hexContent}
          </div>
        </td>
        <td class="cell-2">
          <div class="cell-truncate">
            <h2 class="normal truncate">
              ${dat.metadata.title || `#${encoding.encode(dat.key)}`}
            </h2>
            <p class="f7 color-neutral-60 truncate">
              <span class="">${dat.metadata.author || 'Anonymous'} • </span>
              <span>
                ${dat.owner ? 'Read & Write' : 'Read-only'}
                ${dat.metadata.title && `· #${encoding.encode(dat.key)}`}
              </span>
            </p>
          </div>
        </td>
        <td class="cell-3">
          ${status(dat, stats, send)}
        </td>
        <td class="tr cell-4">
          ${(dat.archive.content.bytes) ? bytes(dat.archive.content.bytes) : 'N/A'}
        </td>
        <td class="tr cell-5">
          ${icon({
            id: 'network'
          })}
          ${peers}
        </td>
        <td class="cell-6">
          <div class="flex justify-end">
            ${button({
              text: 'Open in Finder',
              style: 'icon-only',
              icon: 'open-in-finder',
              cls: 'row-action',
              click: () => send('repos:open', dat)
            })}
            ${button({
              text: 'Copy Dat Link',
              style: 'icon-only',
              icon: 'link',
              cls: 'row-action',
              click: () => send('repos:share', dat)
            })}
            ${button({
              text: 'Remove Dat',
              style: 'icon-only',
              icon: 'delete',
              cls: 'row-action',
              click: () => send('repos:remove', dat)
            })}
          </div>
        </td>
      </tr>
    `
  })
}
