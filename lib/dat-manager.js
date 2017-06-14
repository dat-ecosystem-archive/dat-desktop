const ipc = require('electron').ipcRenderer
const encoding = require('dat-encoding')
const shell = require('electron').shell
const assert = require('assert')
const mkdirp = require('mkdirp')
const path = require('path')

var datJson = require('./dat-json')

module.exports = createManager

// creates a wrapper for all dats. Handles stats, and updates choo's internal
// state whenever a mutation happens
function createManager ({ multidat, dbPaused }, onupdate) {
  assert.ok(multidat, 'lib/dat-manager: multidat should exist')
  assert.ok(dbPaused, 'lib/dat-manager: dbPaused should exist')
  assert.ok(onupdate, 'lib/dat-manager: onupdate should exist')

  // add stats to all recreated dats
  var dats = multidat.list()
  var speed = { up: 0, down: 0 }
  dats.forEach(initDat)
  onupdate(null, dats, speed)

  return {
    create: create,
    close: close,
    pause: pause,
    resume: resume,
    togglePause: togglePause
  }

  function create (dir, opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    assert.equal(typeof dir, 'string', 'dat-manager: dir should be a string')
    assert.equal(typeof opts, 'object', 'dat-manager: opts should be a object')
    assert.equal(typeof cb, 'function', 'dat-manager: cb should be a function')

    mkdirp(dir, function (err) {
      if (err) return cb(err)

      opts = Object.assign(opts, {
        watch: true,
        resume: true,
        ignoreHidden: true,
        compareFileContent: true
      })

      multidat.create(dir, opts, function (err, dat, duplicate) {
        duplicate = duplicate || (err && /temporarily unavailable/.test(err.message))
        if (duplicate) {
          err = new Error('Dat already exists')
          err.warn = true
        }
        if (err) return cb(err)
        initDat(dat)
        update()
        cb(null, dat)
      })
    })
  }

  function close (key, cb) {
    dbPaused.write(key, false, function (err) {
      if (err) return cb(err)
      multidat.close(key, function (err) {
        if (err) return cb(err)
        update()
        cb()
      })
    })
  }

  function pause (dat, cb) {
    var key = encoding.toStr(dat.key)
    dat.leaveNetwork()
    dat.stats.emit('update')
    dbPaused.write(key, true, cb)
  }

  function resume (dat, cb) {
    var key = encoding.toStr(dat.key)
    dat.joinNetwork()
    dat.stats.emit('update')
    dbPaused.write(key, false, cb)
  }

  function togglePause (dat, cb) {
    var key = encoding.toStr(dat.key)
    dbPaused.read(function (err, paused) {
      if (err) return cb(err)
      if (paused[key]) resume(dat, cb)
      else pause(dat, cb)
    })
  }

  function update () {
    speed = { up: 0, down: 0 }
    var dats = multidat.list().slice()
    dats.forEach(function (dat) {
      if (dat instanceof Error) return
      speed.up += dat.stats.network.uploadSpeed
      speed.down += dat.stats.network.downloadSpeed
      var prevProgress = dat.progress
      var stats = dat.stats.get()
      dat.progress = (!stats)
        ? 0
        : dat.writable
          ? 1
          : Math.min(1, stats.downloaded / stats.length)
      var unfinishedBefore = prevProgress < 1 && prevProgress > 0
      if (dat.progress === 1 && unfinishedBefore) {
        var notification = new window.Notification('Download finished', {
          body: dat.metadata.title || dat.key.toString('hex')
        })
        notification.onclick = function () {
          var pathname = 'file://' + path.resolve(dat.path)
          shell.openExternal(pathname, function () {})
        }
      }
    })

    var incomplete = dats.filter(function (dat) {
      return !(dat instanceof Error) && dat.network && dat.progress < 1
    })
    var progress = incomplete.length
      ? incomplete.reduce(function (acc, dat) {
        return acc + dat.progress
      }, 0) / incomplete.length
      : 1
    if (progress === 1) progress = -1 // deactivate

    if (ipc) ipc.send('progress', progress)
    onupdate(null, dats, speed)
  }

  function initDat (dat) {
    if (dat instanceof Error) return

    const key = encoding.toStr(dat.key)
    dbPaused.read((err, paused) => {
      if (err) throw err
      if (!paused[key]) {
        dat.joinNetwork()
        dat.network.on('connection', function (connection) {
          update()
          connection.on('close', update)
        })
        update()
      }
    })

    dat.metadata = {}

    dat.archive.readFile('/dat.json', function (err, blob) {
      if (err && !dat.writable) return
      if (err) {
        var json = datJson(dat)
        json.write(next)
        return
      }
      try {
        next(null, JSON.parse(blob))
      } catch (_) {
        return
      }

      function next (err, metadata) {
        if (err) return
        Object.assign(dat.metadata, metadata)
        update()
      }
    })

    dat.archive.ready(function () {
      update()
    })

    dat.archive.on('content', function () {
      update()
    })

    if (dat.writable) dat.importFiles()

    dat.trackStats()

    var iv = setInterval(function () {
      if (dat._closed) return clearInterval(iv)
      update()
    }, 1000)
  }
}
