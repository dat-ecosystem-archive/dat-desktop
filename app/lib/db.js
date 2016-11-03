const bytewise = require('bytewise')
const assert = require('assert')
const level = require('level')

module.exports = createDb

// create a database
// str -> obj
function createDb (rootDir) {
  assert.equal(typeof rootDir, 'string', 'lib/db: rootDir should be a string')

  return level(`${rootDir}/.db`, {
    keyEncoding: bytewise,
    valueEncoding: 'json'
  })
}
