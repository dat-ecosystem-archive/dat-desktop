const Dat = require('dat-js')
const root = require('./root-dir')
const fs = require('fs')
const persist = require('./persist-dat')
const activate = require('./activate-dat')

module.exports = (key, cb) => {
  const dir = `${root}/${key}`
  fs.mkdir(dir, err => {
    if (err) return cb(err)
    const dat = Dat({ dir, key })
    dat.owner = false
    dat.dir = dir
    persist(dat, err => {
      if (err) return cb(err)
      dat.download()
      cb(null, activate(dat))
    })
  })
}
