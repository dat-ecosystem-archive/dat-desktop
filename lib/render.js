'use strict';

const yo = require('yo-yo');
const button = require('dat-button');
const encoding = require('dat-encoding');
const bytes = require('bytes');
const header = require('./header');
const css = require('yo-css');

const style = {
  table: {
    borderCollapse: 'collapse'
  },
  heading: {
  }
};

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
        <th>Network</th>
        <th>Size</th>
        <th>Actions</th>
      </thead>
      ${Array.from(props.dats.values()).map(dat => yo`
        <tr class="dat-list__item">
          ${'TODO determine arrow direction' && ''}
          <td>${dat.downloaded
            ? '↑'
            : '↓'}</td>
          <td>
            #${encoding.encode(dat.key)}
          </td>
          <td>${dat.owner
            ? 'Read & Write'
            : 'Read only'}</td>
          ${'TODO download state' && ''}
          <td>100%</td>
          <td>${dat.swarm.connections}</td>
          <td>${bytes(dat.content && dat.content.bytes) || '?'}</td>
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
`;
