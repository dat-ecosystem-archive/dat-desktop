'use strict'

const encoding = require('dat-encoding')
const SvgSprite = require('dat-icons')
const html = require('choo/html')
const bytes = require('bytes')
const css = require('yo-css')

const button = require('../elements/button')
const header = require('../elements/header')

const style = {
  table: { borderCollapse: 'collapse' }
}

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
      <table style=${css(style.table)} class="dat-list">
        <thead style=${css(style.heading)} class="dat-list__header">
          <tr>
            <th></th>
            <th>Link</th>
            <th>Download</th>
            <th class="cell-right">Network</th>
            <th class="cell-right">Size</th>
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
  return Object.keys(dats).map((key) => {
    const dat = dats[key]
    return html`
      <tr class="dat-list__item">
        <td>
          <div class="dat-hexagon">
            ${dat.downloaded ? '↑' : '↓'}
          </div>
        </td>
        <td>
          <div class="cell-truncate">
            ${dat.title || `#${encoding.encode(dat.key)}`}
            <br />
            <small style="color:#7C8792">
              ${dat.owner
                ? 'Read & Write'
                : 'Read-only'}
              ${dat.title && `· #${encoding.encode(dat.key)}`}
            </small>
          </div>
        </td>
        ${'TODO download state' && ''}
        <td>
          <div class="progress">
            <div class="progress__counter">
              ${Math.round(dat.progress * 100)}%
            </div>
            <div class="progress__bar">
              <div class="progress__line progress__line--progress" style="width: ${Math.round(dat.progress * 100)}%"></div>
            </div>
          </div>
        </td>
        <td class="cell-right">${dat.swarm.connections}</td>
        <td class="cell-right">
          ${bytes(dat.content && dat.content.bytes) || '?'}
        </td>
        <td>
          ${button({
            icon: 'open-in-finder',
            text: '',
            klass: 'row-action',
            click: () => send('app:open', dat)
          })}
          ${button({
            icon: 'link',
            text: '',
            klass: 'row-action',
            click: () => send('app:share', dat)
          })}
          ${button({
            icon: 'delete',
            text: '',
            klass: 'row-action',
            click: () => send('app:delete', dat)
          })}
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
