#!/usr/bin/env node

const browserify = require('browserify')
const watchify = require('watchify')
const fs = require('fs')
const path = require('path')

const watch = process.argv[2] === 'watch'

const opts = {
  insertGlobals: true,
  ignoreMissing: true,
  builtins: false,
  browserField: false,
  insertGlobalVars: {
    '__dirname': (file, basedir) => {
      var dir = path.dirname('./' + path.relative(basedir, file))
      return JSON.stringify(dir)
    },
    '__filename': (file, basedir) => {
      var filename = './' + path.relative(basedir, file)
      return JSON.stringify(filename)
    },
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
