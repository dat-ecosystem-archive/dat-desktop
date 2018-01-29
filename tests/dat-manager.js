var tape = require('tape')
var Multidat = require('multidat')
var toilet = require('toiletdb/inmemory')

var Manager = require('../lib/dat-manager')

function setup (db, dbPaused, cb) {
  if (typeof db === 'function') {
    dbPaused = db
    db = null
  }
  if (typeof dbPaused === 'function') {
    cb = dbPaused
    dbPaused = null
  }
  if (!db) db = toilet()
  if (!dbPaused) dbPaused = toilet()
  Multidat(db, function (err, multidat) {
    if (err) return cb(err)
    cb(null, { multidat, dbPaused })
  })
}

tape('dat-manager', function (t) {
  t.test('Manager({ multidat, dbPaused, onupdate })', function (t) {
    t.test('assert arguments', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        var onupdate = function () {}
        t.throws(Manager.bind(null))
        t.throws(Manager.bind(null, { multidat }))
        t.throws(Manager.bind(null, { multidat, dbPaused }))
        t.throws(Manager.bind(null, { multidat }, onupdate))
        var manager = Manager({ multidat, dbPaused }, onupdate)
        t.ok(manager)
        manager.disconnect(function (err) {
          t.error(err)
          t.end()
        })
      })
    })
    t.test('load existing dats', function (t) {
      var db = toilet()
      var dbPaused = toilet()
      setup(db, dbPaused, function (err, { multidat, dbPaused }) {
        t.error(err)
        function onupdate () {}
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err) {
          t.error(err)
          manager.disconnect(function () {
            t.error(err)
            secondTime()
          })
        })
      })
      function secondTime () {
        setup(db, dbPaused, function (err, { multidat, dbPaused }) {
          t.error(err)
          var manager = Manager({ multidat, dbPaused }, onupdate)
          var ended = false
          function onupdate (err, dats) {
            if (ended || dats.length !== 1) return
            ended = true
            t.error(err)
            t.equal(dats.length, 1, 'The dat should exist the second time around')
            manager.disconnect(function (err) {
              t.error(err)
              t.end()
            })
          }
        })
      }
    })
  })

  t.test('.create(dir, opts, cb)', function (t) {
    t.test('assert arguments', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        function onupdate () {}
        var manager = Manager({ multidat, dbPaused }, onupdate)
        var dir = `/tmp/${Math.random()}`
        t.throws(manager.create.bind(manager))
        t.throws(manager.create.bind(manager, dir))
        t.throws(manager.create.bind(manager, dir, {}))
        manager.create(dir, {}, function () {})
        manager.create(dir, function () {})
        manager.disconnect(function (err) {
          t.error(err)
          t.end()
        })
      })
    })
    t.test('create a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        var ended = false
        function onupdate (err, dats) {
          if (ended) return
          t.error(err)
          var dat = dats[0]
          if (dat && dat.network && dat.metadata && dat.metadata.title && dat.stats && typeof dat.progress === 'number') {
            t.equal(dat.metadata.title, basename)
            t.equal(dat.metadata.author, 'Anonymous')
            manager.disconnect(function (err) {
              t.error(err)
              t.end()
            })
          }
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        var basename = String(Math.random())
        var dir = `/tmp/${basename}`
        manager.create(dir, function (err, dat) {
          t.error(err)
          t.ok(dat)
        })
      })
    })
  })

  t.test('.close(key, cb)', function (t) {
    t.test('close a dat', function (t) {
      t.plan(6)
      setup(function (err, { multidat, dbPaused }) {
        t.error(err, 'setup')
        var closing = false
        var ended = false
        function onupdate (err, dats) {
          if (!ended && closing && dats.length === 0) {
            t.error(err)
            t.ok(true, 'onupdate')
          }
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err, 'dat created')
          closing = true
          manager.close(dat.key, function (err) {
            t.error(err, 'dat closed')
            ended = true
            manager.disconnect(function (err) {
              t.error(err)
            })
          })
        })
      })
    })
  })

  t.test('.pause(dat, cb)', function (t) {
    t.test('pause a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        function onupdate (err, dats) {
          if (!dats.length || t.ended) return
          t.error(err)
          var dat = dats[0]
          if (!dat) return
          t.notOk(dat.network)
          manager.disconnect(function (err) {
            t.error(err)
            t.end()
          })
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err)
          manager.pause(dat, function (err) {
            t.error(err)
          })
        })
      })
    })
  })

  t.test('.resume(dat, cb)', function (t) {
    t.test('resume a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        var resuming = false
        var ended = false
        function onupdate (err, dats) {
          if (!dats.length || !resuming || ended) return
          ended = true
          t.error(err)
          var dat = dats[0]
          t.ok(dat.network)
          manager.disconnect(function (err) {
            t.error(err)
            t.end()
          })
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err)
          manager.pause(dat, function (err) {
            t.error(err)
            resuming = true
            manager.resume(dat, function (err) {
              t.error(err)
            })
          })
        })
      })
    })
  })

  t.test('.togglePause(dat, cb)', function (t) {
    t.test('pause a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        var ended = false
        function onupdate (err, dats) {
          if (!dats.length || ended) return
          ended = true
          t.error(err)
          var dat = dats[0]
          t.notOk(dat.network)
          manager.disconnect(function (err) {
            t.error(err)
            t.end()
          })
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err)
          manager.togglePause(dat, function (err) {
            t.error(err)
          })
        })
      })
    })
    t.test('resume a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        var resuming = false
        var ended = false
        function onupdate (err, dats) {
          if (!dats.length || !resuming || ended) return
          ended = true
          t.error(err)
          var dat = dats[0]
          t.ok(dat.network)
          manager.disconnect(function (err) {
            t.error(err)
            t.end()
          })
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err)
          manager.togglePause(dat, function (err) {
            t.error(err)
            resuming = true
            manager.togglePause(dat, function (err) {
              t.error(err)
            })
          })
        })
      })
    })
  })

  t.test('finish', function (t) {
    t.end()
    process.exit(Number(!t._ok))
  })
})
