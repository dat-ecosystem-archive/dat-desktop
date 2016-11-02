const raf = require('random-access-file')
const encoding = require('dat-encoding')
const assert = require('assert')
const Dat = require('dat-js')

module.exports = createArchive

// create a new archive
// (obj{str, str}) -> obj
function createArchive ({ path, key }) {
  assert.ok(path, 'lib/create-archive: path is not defined')

  // TODO add back .isFile, https://github.com/joehand/dat-js/issues/29
  // TODO allow to pass in buffer, https://github.com/joehand/dat-js/issues/31
  //if (typeof key === 'string') key = encoding.decode(key)
  if (Buffer.isBuffer(key)) key = encoding.encode(key)

  const archive = Dat({
    dir: path,
    key
  })
  archive.path = path

  return archive
}
