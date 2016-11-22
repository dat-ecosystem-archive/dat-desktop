const encoding = require('dat-encoding')
const bulk = require('bulk-require')
const mount = require('choo/mount')
const log = require('choo-log')
const choo = require('choo')
const fs = require('fs')

const mainView = require('./pages/main')

const app = choo()
app.use(log())

// import & init models
const globs = bulk(__dirname, [ 'models/*' ])
Object.keys(globs).forEach((globname) => {
  const globmatch = globs[globname]
  Object.keys(globmatch).forEach((key) => app.model(globmatch[key]()))
})

// start
app.router(['/', mainView])
mount('body', app.start())
