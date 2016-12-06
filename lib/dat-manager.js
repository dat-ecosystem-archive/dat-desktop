const collect = require('collect-stream')
const Stats = require('hyperdrive-stats')
const sub = require('subleveldown')
const db = require('./db')
const encoding = require('dat-encoding')
const Dat = require('dat-node')
const root = require('./root-dir')
const fs = require('fs')
const EventEmitter = require('events')

module.exports = class Manager extends EventEmitter {
  constructor () {
    super()
    this.dats = []
    this._loadAll((err, _dats) => {
      if (err) return this.emit('error', err)
      for (let dat of _dats) this.dats.push(this._watch(dat))
      this.emit('update')
    })
  }
  _watch (dat) {
    dat.on('update', () => this.emit('update'))
    return dat
  }
  get () {
    return this.dats
  }
  create (dir, cb) {
    const dat = Dat({ dir })
    dat.owner = true
    dat.dir = dir
    dat.share(err => {
      if (err) return cb(err)
      this._persist(dat, err => {
        if (err) return cb(err)
        this.dats.push(this._watch(this._activate(dat)))
        this.emit('update')
        cb()
      })
    })
  }
  download (key, cb) {
    const dir = `${root}/${key}`
    fs.mkdir(dir, err => {
      if (err) return cb(err)
      const dat = Dat({ dir, key })
      dat.owner = false
      dat.dir = dir
      this._persist(dat, err => {
        if (err) return cb(err)
        dat.download()
        this.dats.push(this._watch(this._activate(dat)))
        this.emit('update')
        cb()
      })
    })
  }
  remove (dat, cb) {
    dat.listStream.destroy()
    dat.close(function (err) {
      if (err) return cb(err)
      dat.db.close(err => {
        if (err) return cb(err)
        this.dats.splice(this.dats.indexOf(dat), 1)
        dat.removeListener('update')
        this.emit('update')
        cb()
      })
    })
  }
  _load ({ key, owner, dir }) {
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
  _loadAll (cb) {
    const dats = []
    db.createReadStream({
      gt: ['archive', null],
      lt: ['archive', undefined]
    })
    .on('data', data => {
      dats.push(this._activate(this._load(data.value)))
    })
    .on('error', err => cb(err))
    .on('end', () => cb(null, dats))
  }
  _persist ({ key, owner, dir }, cb) {
    db.put(['archive', key], {
      key: encoding.encode(key),
      owner,
      dir
    }, cb)
  }
  _activate (dat) {
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
}
