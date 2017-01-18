#!/usr/bin/env node

const browserify = require('browserify')
const fs = require('fs')

const b = browserify(`${__dirname}/../app.js`, {
  insertGlobals: true,
  ignoreMissing: true,
  builtins: false,
  browserField: false,
  insertGlobalVars: {
    'process': undefined,
    'global': undefined,
    'Buffer': undefined,
    'Buffer.isBuffer': undefined
  }
})

b.exclude('electron')
b.transform('bindings-browserify/transform', {
  global: true
})
b.transform('aliasify', {
  global: true,
  aliases: {
    bindings: 'bindings-browserify'
  }
})
b.transform('sheetify/transform', {
  use: ['sheetify-nested']
})

b.bundle().pipe(fs.createWriteStream(`${__dirname}/../bundle.js`))
