const assert = require('assert')
const Dat = require('dat-js')

module.exports = createArchive

// create a new archive
function createArchive ({ path, key, owner }) {
  assert.ok(path, 'lib/create-archive: path is not defined')

  const dat = Dat({
    dir: path,
    key
  })
  dat.path = path
  dat.owner = Boolean(owner)

  return dat
}
