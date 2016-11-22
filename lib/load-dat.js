const root = require('./root-dir')
const encoding = require('dat-encoding')
const Dat = require('dat-js')

module.exports = ({ key, owner, dir }) => {
  if (Buffer.isBuffer(key)) key = encoding.encode(key)
  const dat = Dat({ key, dir })
  dat.dir = dir
  dat.owner = owner
  if (dat.owner) {
    dat.share(err => {
      if (err) dat.emit('error', err)
    })
  } else {
    dat.download(err => {
      if (err) dat.emit('error', err)
    })
  }
  return dat
}
