const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const assert = require('assert')
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
    .network-peers-many {
      color: var(--color-green);
    }
    .network-peers-1 {
      color: var(--color-yellow);
    }
    .network-peers-0 {
      color: var(--color-red);
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
          ${dats.map(function (dat) {
            return row(dat, send)
          })}
        </tbody>
      </table>
    </main>
  `
}

function row (dat, send) {
  const stats = dat.stats && dat.stats.get()
  var peers = dat.network.connected
  var key = encoding.encode(dat.key)
  var title = dat.metadata.title || '#' + key

  stats.progress = (!stats)
    ? 0
    : (stats.blocksTotal)
      ? Math.round((stats.blocksProgress / stats.blocksTotal) * 100)
      : 0

  // place an upper bound of 100% on progress. We've encountered situations
  // where blocks downloaded exceeds total block. Once that's fixed this
  // should be safe to be removed
  stats.progress = Math.min(stats.progress, 100)

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

  var finderButton = button({
    text: 'Open in Finder',
    style: 'icon-only',
    icon: 'open-in-finder',
    cls: 'row-action',
    click: () => send('repos:open', dat)
  })

  var linkButton = button({
    text: 'Copy Dat Link',
    style: 'icon-only',
    icon: 'link',
    cls: 'row-action',
    click: () => send('repos:share', dat)
  })

  var deleteButton = button({
    text: 'Remove Dat',
    style: 'icon-only',
    icon: 'delete',
    cls: 'row-action',
    click: function (e) {
      // TODO: we're relying on DOM ordering here. Fix this in choo by moving
      // to nanomorph; e.g. events are still copied over when reordering
      var target = e.target
      while (target.parentNode) {
        var id = target.getAttribute('id')
        if (id) break
        target = target.parentNode
      }
      assert.equal(typeof id, 'string', 'elements/table.deleteButton: id should be type string')
      send('repos:remove', { key: id })
    }
  })

  return html`
    <tr id=${key}>
      <td class="cell-1">
        <div class="w2 pa1 center">
          ${hexContent}
        </div>
      </td>
      <td class="cell-2">
        <div class="cell-truncate">
          <h2 class="normal truncate">
            ${title}
          </h2>
          <p class="f7 color-neutral-60 truncate">
            <span class="">${dat.metadata.author || 'Anonymous'} • </span>
            <span>
              ${dat.owner ? 'Read & Write' : 'Read-only'}
              ${title}
            </span>
          </p>
        </div>
      </td>
      <td class="cell-3">
        ${status(dat, stats, send)}
      </td>
      <td class="tr cell-4">
        ${(dat.archive.content) ? bytes(dat.archive.content.bytes) : 'N/A'}
      </td>
      <td class="tr cell-5">
        ${icon({
          id: 'network',
          cls: peers > 1 ? 'network-peers-many'
            : peers > 0 ? 'network-peers-1'
            : 'network-peers-0'
        })}
        ${peers}
      </td>
      <td class="cell-6">
        <div class="flex justify-end">
          ${finderButton}
          ${linkButton}
          ${deleteButton}
        </div>
      </td>
    </tr>
  `
}
