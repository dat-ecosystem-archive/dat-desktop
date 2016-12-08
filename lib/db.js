const bytewise = require('bytewise')
const level = require('level')
const root = require('./root-dir')

module.exports = level(`${root}/.db`, {
  keyEncoding: bytewise,
  valueEncoding: 'json'
})
