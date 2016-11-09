const raf = require('random-access-file')
const encoding = require('dat-encoding')
const assert = require('assert')
const Dat = require('dat-js')

module.exports = createArchive

// create a new archive
// (obj{str, str}) -> obj
function createArchive ({ path, key }) {
  assert.ok(path, 'lib/create-archive: path is not defined')

  const archive = Dat({
    dir: path,
    key
  })
  archive.path = path

  return archive
}
