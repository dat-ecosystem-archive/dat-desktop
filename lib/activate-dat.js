const collect = require('collect-stream')
const Stats = require('hyperdrive-stats')
const sub = require('subleveldown')
const db = require('./db')
const encoding = require('dat-encoding')

module.exports = (dat) => {
  dat.open(err => {
    if (err) throw err
    dat.listStream = dat.archive.list({ live: true })
    dat.listStream.on('data', entry => {
      if (entry.name !== 'dat.json') return
      collect(dat.archive.createFileReadStream('dat.json'), (err, raw) => {
        if (err) return console.error('failed to read dat.json', err)
        let json
        try {
          json = JSON.parse(raw.toString())
        } catch (err) {
          console.error('failed to parse dat.json', err)
          return
        }
        dat.title = json.title
        dat.emit('update')
      })
    })
    dat.hyperStats = Stats({
      archive: dat.archive,
      db: sub(db, `${encoding.encode(dat.key)}-stats`)
    })
    dat.hyperStats.on('update', () => dat.emit('update'))
    dat.on('files-counted', () => dat.emit('update'))
    dat.on('archive-finalized', () => dat.emit('update'))
    dat.on('archive-updated', () => dat.emit('update'))
    dat.on('download-finished', () => dat.emit('update'))
    dat.on('swarm-update', () => dat.emit('update'))
  })
  return dat
}
