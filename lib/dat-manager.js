const collect = require('collect-stream')
const db = require('./db')
const encoding = require('dat-encoding')
const Dat = require('dat-node')
const root = require('./root-dir')
const fs = require('fs')
const EventEmitter = require('events')
const { Transform } = require('stream')

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
    dat.events.on('update', () => this.emit('update'))
    return dat
  }
  get () {
    return this.dats
  }
  create (dir, cb) {
    Dat(dir, (err, dat) => {
      if (err) return cb(err)

      dat.joinNetwork()
      dat.importFiles(err => {
        if (err) this.emit('error', err)
      })

      this._persist(dat, err => {
        if (err) return cb(err)
        this.dats.push(this._watch(this._activate(dat)))
        this.emit('update')
        cb()
      })
    })
  }
  download (key, cb) {
    key = encoding.toStr(key)
    const dir = `${root}/${key}`
    fs.mkdir(dir, err => {
      if (err && err.code !== 'EEXIST') return cb(err)

      Dat(dir, { key }, (err, dat) => {
        if (err) return cb(err)

        dat.joinNetwork()

        this._persist(dat, err => {
          if (err) return cb(err)
          this.dats.push(this._watch(this._activate(dat)))
          this.emit('update')
          cb()
        })
      })
    })
  }
  remove (dat, cb) {
    dat.listStream.destroy()
    dat.close(err => {
      if (err) return cb(err)

      this.dats.splice(this.dats.indexOf(dat), 1)
      dat.events.removeAllListeners('update')

      db.del(['archive', dat.key], (err) => {
        if (err) return cb(err)

        this.emit('update')
        cb()
      })
    })
  }
  _load ({ key, dir }, cb) {
    if (Buffer.isBuffer(key)) key = encoding.encode(key)
    Dat(dir, { key }, (err, dat) => {
      if (err) return cb(err)

      dat.joinNetwork()

      if (dat.owner) {
        dat.importFiles(err => {
          if (err) this.emit('error', err)
        })
      }
      cb(null, dat)
    })
  }
  _loadAll (cb) {
    const dats = []
    db.createReadStream({
      gt: ['archive', null],
      lt: ['archive', undefined]
    })
    .pipe(Transform({
      objectMode: true,
      transform: (data, _, done) => {
        this._load(data.value, (err, dat) => {
          if (err) return cb(err)
          dats.push(this._activate(dat))
          done()
        })
      }
    }))
    .on('error', err => cb(err))
    .on('finish', () => cb(null, dats))
  }
  _persist ({ key, dir }, cb) {
    db.put(['archive', key], {
      key: encoding.encode(key),
      dir
    }, cb)
  }
  _activate (dat) {
    dat.events = new EventEmitter()
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
        dat.author = json.author
        dat.events.emit('update')
      })
    })
    const stats = dat.trackStats()
    stats.on('update', () => dat.events.emit('update'))
    Object.defineProperty(dat, 'stats', {
      get: () => stats.get()
    })
    return dat
  }
}
