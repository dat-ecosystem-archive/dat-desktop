const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')
const assert = require('assert')
const css = require('sheetify')

const button = require('./button')
const status = require('./status')
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
      vertical-align: top;
      padding-top: 1rem;
    }
    tr:hover td {
      background-color: var(--color-neutral--04);
    }
    .cell-1 {
      width: 4rem;
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
      height: 1.5rem;
      display: inline-block;
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
      display: inline-block;
      color: var(--color-neutral-20);
      vertical-align: sub;
      width: 1em;
      svg {
        border: 1px solid red;
      }
      svg polygon {
        fill: inherit;
      }
    }
    .network-peers-many {
      --polygon-1-color: var(--color-green);
      --polygon-2-color: var(--color-green);
      --polygon-3-color: var(--color-green);
    }
    .network-peers-1 {
      --polygon-1-color: var(--color-yellow);
      --polygon-2-color: var(--color-yellow);
    }
    .network-peers-0 {
      --polygon-1-color: var(--color-red);
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
            <th class="tl cell-5">Peers</th>
            <th class="tr cell-6">History</th>
            <th class="cell-7"></th>
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
  var peers = (dat.network)
    ? dat.network.connected
    : 'N/A'
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
  stats.size = (dat.archive.content) ? bytes(dat.archive.content.bytes) : 'N/A'

  stats.state = (dat.network)
    ? (dat.owner || stats.progress === 100)
      ? 'complete'
      : (peers)
        ? 'loading'
        : 'stale'
    : 'paused'

  const togglePause = () => send('repos:togglePause', dat)

  const hexContent = {
    loading: button.icon('loading', {
      icon: icon('hexagon-down', {class: 'w2'}),
      class: 'color-blue hover-color-blue-hover',
      onclick: togglePause
    }),
    stale: button.icon('stale', {
      icon: icon('hexagon-x', {class: 'w2'}),
      class: 'color-neutral-30 hover-color-neutral-40',
      onclick: togglePause
    }),
    paused: button.icon('paused', {
      icon: icon('hexagon-resume', {class: 'w2'}),
      class: 'color-neutral-30 hover-color-neutral-40',
      onclick: togglePause
    }),
    complete: button.icon('complete', {
      icon: icon('hexagon-up', {class: 'w2'}),
      class: 'color-green hover-color-green-hover',
      onclick: togglePause
    })
  }[stats.state]

  function getId (target) {
    let id = null
    while (target.parentNode) {
      id = target.getAttribute('id')
      if (id) break
      target = target.parentNode
    }
    return id
  }

  function toggleHistory (e) {
    var id = getId(e.target)
    send('repos:toggleHistory', {key: id, action: e.target.checked})
  }

  var historyButton = function () {
    console.log(dat.historical)
    if (dat.historical === undefined) return html`` // loading
    return html`
      <input type="checkbox" checked="${dat.historical}" onclick=${toggleHistory}/>
    `
  }

  var finderButton = button.icon('Open in Finder', {
    icon: icon('open-in-finder'),
    class: 'row-action',
    onclick: () => send('repos:open', dat)
  })

  var linkButton = button.icon('Share Dat', {
    icon: icon('link'),
    class: 'row-action',
    onclick: () => send('repos:share', dat)
  })

  var deleteButton = button.icon('Remove Dat', {
    icon: icon('delete'),
    class: 'delete row-action',
    onclick: function (e) {
      // FIXME: we're relying on DOM ordering here. Fix this in choo by moving
      // to nanomorph; e.g. events are still copied over when reordering
      var target = e.target
      var id = getId(target)
      assert.equal(typeof id, 'string', 'elements/table.deleteButton: id should be type string')
      send('repos:remove', { key: id })
    }
  })

  var networkIcon = icon('network', {
    class: (peers > 1)
      ? 'network-peers-many'
      : (peers > 0)
        ? 'network-peers-1'
        : 'network-peers-0'
  })

  return html`
    <tr id=${key}>
      <td class="cell-1">
        <div class="w2 center">
          ${hexContent}
        </div>
      </td>
      <td class="cell-2">
        <div class="cell-truncate">
          <h2 class="f6 normal truncate">
            ${title}
          </h2>
          <p class="f7 color-neutral-60 truncate">
            <span class="author">${dat.metadata.author || 'Anonymous'} • </span>
            <span class="title">
              ${dat.owner ? 'Read & Write' : 'Read-only'}
            </span>
          </p>
        </div>
      </td>
      <td class="cell-3">
        ${status(dat, stats, send)}
      </td>
      <td class="tr cell-4 size">
        ${stats.size}
      </td>
      <td class="cell-5">
        ${networkIcon}
        <span class="network">${peers}</span>
      </td>
      <td class="cell-6">
        <div class="flex justify-end">
          ${finderButton}
          ${linkButton}
          ${deleteButton}
          ${historyButton()}
        </div>
      </td>
    </tr>
  `
}
