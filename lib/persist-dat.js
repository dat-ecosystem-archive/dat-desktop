const db = require('./db')
const encoding = require('dat-encoding')

module.exports = ({ key, owner, dir }, cb) => {
  db.put(['archive', key], {
    key: encoding.encode(key),
    owner,
    dir
  }, cb)
}
