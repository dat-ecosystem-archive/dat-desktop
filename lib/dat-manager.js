const ipc = require('electron').ipcRenderer
const encoding = require('dat-encoding')
const assert = require('assert')
const mkdirp = require('mkdirp')

function noop () {}

module.exports = createManager

// creates a wrapper for all dats. Handles stats, and updates choo's internal
// state whenever a mutation happens
function createManager ({ multidat, dbPaused, downloadsDir }, onupdate) {
  assert.ok(multidat, 'models/repos: multidat should exist')
  assert.ok(onupdate, 'models/repos: onupdate should exist')

  // add stats to all recreated dats
  var dats = multidat.list()
  dats.forEach(initDat)
  onupdate(null, dats)

  return {
    create: create,
    close: close,
    closeAll: closeAll,
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

      multidat.create(dir, opts, function (err, dat) {
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

  function closeAll () {
		var tasks = multidat.list().map(function (dat, i) {
      return function () {
        var done = arguments[arguments.length - 1]
        dat.close(done)
      }
    })
    waterfall(tasks, cb)
  }

  function pause (dat, cb) {
    var key = encoding.toStr(dat.key)
    dat.leaveNetwork()
    dbPaused.write(key, true, cb)
  }

  function resume (dat, cb) {
    var key = encoding.toStr(dat.key)
    dat.joinNetwork()
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
    var dats = multidat.list().slice()
    dats.forEach(function (dat) {
      var stats = dat.stats && dat.stats.get()
      dat.progress = (!stats)
        ? 0
        : (stats.blocksTotal)
          ? Math.min(1, stats.blocksProgress / stats.blocksTotal)
          : 0
    })

    var incomplete = dats.filter(function (dat) {
      return dat.network && dat.progress < 1
    })
    var progress = incomplete.reduce(function (acc, dat) {
      return acc + dat.progress
    }, 0) / incomplete.length
    if (progress === 1) progress = -1 // deactivate

    ipc.send('progress', progress)
    onupdate(null, dats)
  }

  function initDat (dat) {
    const key = encoding.toStr(dat.key)
    dbPaused.read((err, paused) => {
      if (err) throw err
      if (!paused[key]) {
        dat.joinNetwork()
      }
    })

    dat.metadata = {}

    multidat.readManifest(dat, function (_, manifest) {
      if (!manifest) return
      dat.metadata.title = manifest.title
      dat.metadata.author = manifest.author
      update()
    })

    dat.on('update', update)
  }
}
