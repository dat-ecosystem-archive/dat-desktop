'use strict'

const yo = require('yo-yo')
const button = require('dat-button')
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
        <th>Owner/Rights</th>
        <th>Download</th>
        <th class="cell-right">Network</th>
        <th class="cell-right">Size</th>
        <th>Actions</th>
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
              #${encoding.encode(dat.key)}
            </div>
          </td>
          <td>${dat.owner
            ? 'Read & Write'
            : 'Read only'}</td>
          ${'TODO download state' && ''}
          <td>
            <div class="progress">
              <div class="progress__counter">
                100%
              </div>
              <div class="progress__bar">
                <div class="progress__line progress__line--complete" style="width: 100%"></div>
              </div>
            </div>
          </td>
          <td class="cell-right">${dat.swarm.connections}</td>
          <td class="cell-right">${bytes(dat.content && dat.content.bytes) || '?'}</td>
          <td>
            ${button({
              text: 'Open',
              click: () => props.open(dat)
            })}
            ${button({
              text: 'Share',
              click: () => props.share(dat)
            })}
            ${button({
              text: 'Delete',
              click: () => props.delete(dat)
            })}
          </td>
        </tr>
      `)}
    </table>
  </div>
`
