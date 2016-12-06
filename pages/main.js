'use strict'

const encoding = require('dat-encoding')
const SvgSprite = require('dat-icons')
const html = require('choo/html')
const bytes = require('bytes')

const button = require('../elements/button')
const Header = require('../elements/header')
const Modal = require('../elements/modal')

const modal = Modal()

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const dats = state.app.archives

  const header = Header({
    create: () => send('app:create'),
    download: (link) => send('app:download', link)
  })

  const table = html`
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

  return html`
    <body>
      ${svgSprite()}
      ${header}
      ${table}
      ${modal(state.location.search.modal)}
    </body>
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

function svgSprite () {
  const _el = document.createElement('div')
  _el.innerHTML = SvgSprite()
  return _el.childNodes[0]
}
