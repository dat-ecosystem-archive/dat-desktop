const collect = require('collect-stream')
const db = require('./db')
const encoding = require('dat-encoding')
const Dat = require('dat-node')
const root = require('./root-dir')
const fs = require('fs')
const assert = require('assert')
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
  create (path, cb) {
    assert.equal(typeof path, 'string', 'dat-manager.create: path should be type string')
    assert.equal(typeof cb, 'function', 'dat-manager.create: cb should be type function')

    Dat(path, (err, dat) => {
      if (err) return cb(err)

      assert.equal(typeof dat, 'object', 'dat-manager.create: dat should be type object')

      dat.joinNetwork()
      dat.importFiles((err) => {
        if (err) this.emit('error', err)
      })

      this._persist(dat, (err) => {
        if (err) return cb(err)
        this.dats.push(this._watch(this._activate(dat)))
        this.emit('update')
        cb()
      })
    })
  }
  download (key, cb) {
    assert.equal(typeof key, 'string', 'dat-manager.download: key should be type string')
    assert.equal(typeof cb, 'function', 'dat-manager.download: cb should be type function')

    key = encoding.toStr(key)
    const path = `${root}/${key}`
    fs.mkdir(path, (err) => {
      if (err && err.code !== 'EEXIST') return cb(err)

      Dat(path, { key }, (err, dat) => {
        if (err) return cb(err)

        assert.equal(typeof dat, 'object', 'dat-manager.download: dat should be type object')
        dat.joinNetwork()

        this._persist(dat, (err) => {
          if (err) return cb(err)
          this.dats.push(this._watch(this._activate(dat)))
          this.emit('update')
          cb()
        })
      })
    })
  }
  remove (dat, cb) {
    assert.equal(typeof dat, 'object', 'dat-manager.remove: dat should be type object')
    assert.equal(typeof cb, 'function', 'dat-manager.remove: cb should be type function')

    dat.listStream.destroy()
    dat.close((err) => {
      console.trace(err)
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
  _load (dat, cb) {
    var key = dat.key
    var path = dat.path
    assert.ok(typeof key === 'string' || Buffer.isBuffer(key), 'dat-manager._load: key should be type string or type buffer')
    assert.equal(typeof path, 'string', 'dat-manager._load: path should be type string')
    assert.equal(typeof cb, 'function', 'dat-manager._load: cb should be type function')

    if (Buffer.isBuffer(key)) key = encoding.encode(key)
    Dat(path, { key }, (err, dat) => {
      if (err) return cb(err)

      assert.equal(typeof dat, 'object', 'dat-manager._load: dat should be type object')

      dat.joinNetwork()

      if (dat.owner) {
        dat.importFiles((err) => {
          if (err) this.emit('error', err)
        })
      }
      cb(null, dat)
    })
  }
  _loadAll (cb) {
    assert.equal(typeof cb, 'function', 'dat-manager._loadAll: cb should be type function')

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

          assert.equal(typeof dat, 'object', 'dat-manager._loadAll: dat should be type object')
          dats.push(this._activate(dat))
          done()
        })
      }
    }))
    .on('error', err => cb(err))
    .on('finish', () => cb(null, dats))
  }
  _persist (dat, cb) {
    var key = dat.key
    var path = dat.path
    assert.ok(typeof key === 'string' || Buffer.isBuffer(key), 'dat-manager._persist: key should be type string or type buffer')
    assert.equal(typeof path, 'string', 'dat-manager._persist: path should be type string')
    assert.equal(typeof cb, 'function', 'dat-manager._persist: cb should be type function')

    var data = {
      key: encoding.encode(key),
      path: path
    }

    db.put(['archive', key], data, cb)
  }
  _activate (dat) {
    assert.equal(typeof dat, 'object', 'dat-manager._activate: dat should be type object')

    dat.events = new EventEmitter()
    dat.listStream = dat.archive.list({ live: true })
    dat.listStream.on('data', (entry) => {
      assert.equal(typeof entry, 'object', 'dat-manager._activate: entry should be type object')
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
