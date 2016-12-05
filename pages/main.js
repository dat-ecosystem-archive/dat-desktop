'use strict'

const encoding = require('dat-encoding')
const SvgSprite = require('dat-icons')
const html = require('choo/html')
const bytes = require('bytes')

const button = require('../elements/button')
const header = require('../elements/header')

module.exports = mainView

// render the main view
// (obj, obj, fn) -> html
function mainView (state, prev, send) {
  const dats = state.app.archives
  return html`
    <body>
      ${svgSprite()}
      ${header({
        create: () => send('app:create'),
        download: (link) => send('app:download', link)
      })}
      <table class="w-100 collapse table">
        <thead class="table-header">
          <tr>
            <th></th>
            <th class="tl">Link</th>
            <th class="tl">Download</th>
            <th class="tr">Network</th>
            <th class="tr">Size</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${createTable(dats, send)}
        </tbody>
      </table>
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
      paused: '',
      complete: '↑'
    }[state]
    return html`
      <tr class="table-item">
        <td>
          <div class="dat-hexagon">${hexContent}</div>
        </td>
        <td>
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
        <td>
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
        <td class="tr">${dat.stats.peers}</td>
        <td class="tr">
          ${bytes(dat.stats.bytesTotal)}
        </td>
        <td>
          <div class="flex">
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
