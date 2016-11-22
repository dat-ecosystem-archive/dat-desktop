const Dat = require('dat-js')
const persist = require('./persist-dat')
const activate = require('./activate-dat')

module.exports = (dir, cb) => {
  const dat = Dat({ dir })
  dat.owner = true
  dat.dir = dir
  dat.share(err => {
    if (err) return cb(err)
    persist(dat, err => {
      if (err) return cb(err)
      cb(null, activate(dat))
    })
  })
}
