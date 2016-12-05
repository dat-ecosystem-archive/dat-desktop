const bytewise = require('bytewise')
const assert = require('assert')
const level = require('level')
const root = require('./root-dir')

module.exports = level(`${root}/.db`, {
  keyEncoding: bytewise,
  valueEncoding: 'json'
})
