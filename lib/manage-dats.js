const create = require('./create-dat')
const load = require('./load-dats')
const importDat = require('./import-dat')
const deleteDat = require('./delete-dat')
const activate = require('./activate-dat')
const {EventEmitter} = require('events')

module.exports = () => {
  const events = new EventEmitter()
  const watch = dat => {
    dat.on('update', () => events.emit('update'))
    return dat
  }
  const dats = []
  load((err, _dats) => {
    if (err) return events.emit('error', err)
    for (let dat of _dats) dats.push(watch(dat))
    events.emit('update')
  })
  return {
    events,
    get: () => dats,
    create: (dir, cb) => {
      console.log({dir})
      create(dir, (err, dat) => {
        console.log({dir})
        if (err) return cb(err)
        dats.push(watch(dat))
        events.emit('update')
        console.log({dats})
        cb()
      })
    },
    importDat: (key, cb) => {
      importDat(key, (err, dat) => {
        if (err) return cb(err)
        dats.push(watch(dat))
        events.emit('update')
        cb()
      })
    },
    deleteDat: (dat, cb) => {
      deleteDat(dat, err => {
        if (err) return cb(err)
        dats.splice(dats.indexOf(dat), 1)
        dat.removeListener('update')
        events.emit('update')
        cb()
      })
    }
  }
}
