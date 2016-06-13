'use strict';

const yo = require('yo-yo');
const hyperdriveUI = require('hyperdrive-ui');

module.exports = (archives, selected, local, files, add, select) => yo`
  <div>
    <h2>Archives</h2>
    <ul>
      ${Array.from(archives.keys()).map(key => yo`
        <li>
          <a onclick=${select(key)} href=#>
            ${key}
          </a>
          ${key === local.key.toString('hex')
            ? '(your dat)'
            : ''}
        </li>
      `)}
    </ul>
    <form onsubmit=${add}>
      <input type="text" placeholder="Link">
      <input type="submit" value="Add archive">
    </form>
    <h1>${selected.key.toString('hex')}</h1>
    ${hyperdriveUI(selected)}
  </div>`;
