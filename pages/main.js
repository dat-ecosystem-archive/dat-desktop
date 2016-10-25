'use strict'

const encoding = require('dat-encoding')
const svgSprite = require('dat-icons')
const html = require('choo/html')
const bytes = require('bytes')
const css = require('yo-css')

const button = require('./button')
const header = require('./header')

const style = {
  table: {
    borderCollapse: 'collapse'
  },
  heading: {
  }
}

document.body.innerHTML += svgSprite()

module.exports = mainView

// render the main view
// obj -> html
function mainView (props) {
  return html`
    <div>
      ${header({
        create: props.create,
        download: props.download,
        logout: props.logout
      })}
      <table style=${css(style.table)} class="dat-list">
        <thead style=${css(style.heading)} class="dat-list__header">
          <th></th>
          <th>Link</th>
          <th>Download</th>
          <th class="cell-right">Network</th>
          <th class="cell-right">Size</th>
          <th></th>
        </thead>
        ${Array.from(props.dats.values()).map((dat) => html`
          <tr class="dat-list__item">
            <td>
              <div class="dat-hexagon">
                ${dat.downloaded
                ? '↑'
                : '↓'}
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
                click: () => props.open(dat)
              })}
              ${button({
                icon: 'link',
                text: '',
                klass: 'row-action',
                click: () => props.share(dat)
              })}
              ${button({
                icon: 'delete',
                text: '',
                klass: 'row-action',
                click: () => props.delete(dat)
              })}
            </td>
          </tr>
        `)}
      </table>
    </div>
  `
}
