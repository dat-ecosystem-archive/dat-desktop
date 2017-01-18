#!/usr/bin/env node

const browserify = require('browserify')
const watchify = require('watchify')
const fs = require('fs')

const watch = process.argv[2] === 'watch'

const opts = {
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
}

if (watch) {
  opts.cache = {}
  opts.packageCache = {}
  opts.plugin = [watchify]
}

const b = browserify(`${__dirname}/../app.js`, opts)

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

const bundle = () => {
  process.stderr.write(`${new Date()} bundling...`)
  b.bundle().pipe(fs.createWriteStream(`${__dirname}/../bundle.js`))
  .on('finish', () => process.stderr.write('ok!\n'))
}

b.on('update', bundle)
bundle()
