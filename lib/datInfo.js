'use strict'
var bytes = require('prettier-bytes')

function datPeers (dat) {
  return dat.network ? dat.network.connected : 'N/A'
}

module.exports = {
  datPeers,
  datSize (dat) {
    return dat.archive.content
      ? bytes(dat.archive.content.byteLength)
      : 'N/A'
  },
  datState (dat) {
    return !dat.network
      ? 'paused'
      : dat.writable || dat.progress === 1
      ? 'complete'
      : datPeers(dat)
      ? 'loading'
      : 'stale'
  }
}
