#!/usr/bin/env node

const browserify = require('../lib/browserify')

const watch = process.argv[2] === 'watch'
browserify({ watch })
