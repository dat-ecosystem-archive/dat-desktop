const raf = require('random-access-file')
const encoding = require('dat-encoding')
const assert = require('assert')
const Dat = require('dat-js')

module.exports = createArchive

// create a new archive
function createArchive ({ path, key, owner }) {
  assert.ok(path, 'lib/create-archive: path is not defined')

  const archive = Dat({
    dir: path,
    key
  })
  archive.path = path
  archive.owner = Boolean(owner)

  return archive
}
