'use strict'
const Nanocomponent = require('nanocomponent')
const html = require('choo/html')

function TableHead () {
  if (!(this instanceof TableHead)) return new TableHead()
  Nanocomponent.call(this)
}

TableHead.prototype = Object.create(Nanocomponent.prototype)

TableHead.prototype.createElement = function () {
  return html`
      <thead>
        <tr>
          <th class="cell-1"></th>
          <th class="tl cell-2">Link</th>
          <th class="tl cell-3">Status</th>
          <th class="tl cell-4">Size</th>
          <th class="tl cell-5">Peers</th>
          <th class="cell-6"></th>
        </tr>
      </thead>
    `
}

TableHead.prototype.update = function () {
  return
}

module.exports = TableHead
