const shell = require('electron').shell
const path = require('path')
const assert = require('assert')
const encoding = require('dat-encoding')
const Modal = require('../elements/modal')

module.exports = function (state, bus) {
  function onerror (err) {
    if (err) bus.emit('error', err)
  }

  // open the dat archive in the native filesystem explorer
  bus.on('dats:open', function (dat) {
    var pathname = 'file://' + path.resolve(dat.path)
    shell.openExternal(pathname, onerror)
  })

  // copy a dat share link to clipboard and open a modal
  bus.on('dats:share', function (dat) {
    assert.ok(dat.key, 'dats-model.shareDat: data.key should exist')
    const encodedKey = encoding.toStr(dat.key)
    const modal = Modal.link()(encodedKey)
    document.body.appendChild(modal)
  })

  bus.once('dats:manager', function (manager) {
    bus.on('dats:remove', function (dat) {
      if (!Modal) {
        return
      }

      const modal = Modal.confirm()(function () {
        manager.close(dat.key, function (err) {
          if (err) return onerror(err)
          bus.emit('render')
        })
      })

      document.body.appendChild(modal)
    })
  })
}
