const browserify = require('browserify')
const watchify = require('watchify')
const fs = require('fs')
const path = require('path')

module.exports = ({ watch }) => {
  const opts = {
    insertGlobals: true,
    ignoreMissing: true,
    builtins: false,
    browserField: false,
    insertGlobalVars: {
      '__dirname': (file, basedir) => {
        return '__dirname + "/" + ' +
          JSON.stringify(path.dirname(path.relative(basedir, file)))
      },
      '__filename': (file, basedir) => {
        return '__dirname + "/" + ' +
          JSON.stringify(path.relative(basedir, file))
      },
      'process': undefined,
      'global': undefined,
      'Buffer': undefined,
      'Buffer.isBuffer': undefined
    },
    postFilter: (id, file, pkg) => {
      if (!file) return false
      if (file.indexOf('node_modules') > -1 && file.indexOf('sheetify') === -1) {
        return false
      }
      return true
    }
  }

  if (watch) {
    opts.cache = {}
    opts.packageCache = {}
    opts.plugin = [watchify]
  }

  const b = browserify(`${__dirname}/../app.js`, opts)

  b.transform('envify')
  b.transform('sheetify/transform', { use: ['sheetify-nested'] })

  const bundle = () => {
    process.stderr.write(`${new Date()} bundling...`)
    b.bundle().pipe(fs.createWriteStream(`${__dirname}/../bundle.js`))
    .on('finish', () => process.stderr.write('ok!\n'))
  }

  b.on('update', bundle)
  bundle()
}
