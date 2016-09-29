'use strict'

const yo = require('yo-yo')
const button = require('./button')
const encoding = require('dat-encoding')
const bytes = require('bytes')
const header = require('./header')
const css = require('yo-css')

const style = {
  table: {
    borderCollapse: 'collapse'
  },
  heading: {
  }
}

module.exports = (props) => yo`
  <div>
    ${header({
      create: props.create,
      download: props.download
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
      ${Array.from(props.dats.values()).map(dat => yo`
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
          <td class="cell-right">${bytes(dat.content && dat.content.bytes) || '?'}</td>
          <td>
            ${button({
              icon: './public/img/open-in-finder.svg',
              text: '',
              klass: 'dat-header-action',
              click: () => props.open(dat)
            })}
            ${button({
              icon: './public/img/link.svg',
              text: '',
              klass: 'dat-header-action',
              click: () => props.share(dat)
            })}
            ${button({
              icon: './public/img/delete.svg',
              text: '',
              klass: 'dat-header-action',
              click: () => props.delete(dat)
            })}
          </td>
        </tr>
      `)}
    </table>
  </div>
`
