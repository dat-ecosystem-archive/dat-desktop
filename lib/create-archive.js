const raf = require('random-access-file')
const encoding = require('dat-encoding')
const assert = require('assert')

module.exports = createArchive

// create a new archive
// (obj, obj{str, str, fn}) -> obj
function createArchive (drive, { path, key, isFile }) {
  assert.ok(drive, 'lib/create-archive: drive is not defined')
  assert.ok(path, 'lib/create-archive: path is not defined')
  assert.ok(key, 'lib/create-archive: key is not defined')
  assert.ok(isFile, 'lib/create-archive: isFile is not defined')

  if (typeof key === 'string') key = encoding.decode(key)
  const archive = drive.createArchive(key, {
    live: true,
    file: name => raf(isFile
      ? archive.path
      : `${archive.path}/${name}`)
  })
  archive.path = path
  return archive
}
