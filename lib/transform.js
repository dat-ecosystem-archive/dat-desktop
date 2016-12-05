'use strict'

const through = require('through2')

module.exports = file => {
  if (!/\.js$/.test(file)) return through()
  let src = ''
  const out = through((chunk, _, cb) => {
    src += chunk
    cb()
  }, function (cb) {
    src = src.replace(/require\('bindings'\)\('(.*)'\)/, (_, bindings) =>
      `require('bindings')({ bindings: '${bindings}', module_root: __dirname })`
    )
    this.push(src)
    cb()
  })
  return out
}
