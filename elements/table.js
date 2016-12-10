const encoding = require('dat-encoding')
const bytes = require('prettier-bytes')
const html = require('choo/html')

const button = require('./button')

module.exports = tableElement

function tableElement (dats, send) {
  return html`
    <table class="w-100 collapse table">
      <thead class="table-header">
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
      loading: '↓',
      paused: 'II',
      complete: '↑'
    }[state]

    return html`
      <tr class="table-item">
        <td class="cell-1">
          <div class="dat-hexagon">${hexContent}</div>
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
          <svg class="network-svg">
            <use xlink:href="#daticon-network" />
          </svg>
          ${dat.stats.peers}
        </td>
        <td class="cell-6">
          <div class="flex justify-end">
            ${button({
              icon: 'open-in-finder',
              text: '',
              cls: 'row-action',
              click: () => send('repos:open', dat)
            })}
            ${button({
              icon: 'link',
              text: '',
              cls: 'row-action',
              click: () => send('repos:share', dat)
            })}
            ${button({
              icon: 'delete',
              text: '',
              cls: 'row-action',
              click: () => send('repos:delete', dat)
            })}
          </div>
        </td>
      </tr>
    `
  })
}
