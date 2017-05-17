var tape = require('tape')
var Multidat = require('multidat')
var toilet = require('toiletdb/inmemory')
var fs = require('fs')

var Manager = require('../lib/dat-manager')

function setup (cb) {
  var db = toilet()
  var dbPaused = toilet()
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
        manager = Manager({ multidat, dbPaused }, onupdate)
        t.ok(manager)
        t.end()
      })
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
        t.end()
      })
    })
    t.test('create a dat', function (t) {
      setup(function (err, { multidat, dbPaused }) {
        t.error(err)
        function onupdate (err, dats) {
          if (t.ended) return
          t.error(err)
          var dat = dats[0]
          if (dat && dat.network && dat.metadata && dat.metadata.title && dat.stats && typeof dat.progress === 'number') {
            t.end()
          }
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        var dir = `/tmp/${Math.random()}`
        manager.create(dir, function (err, dat) {
          t.error(err)
          t.ok(dat)
        })
      })
    })
  })
  
  t.test('.close(key, cb)', function (t) {
    t.test('close a dat', function (t) {
      t.plan(4)
      setup(function (err, { multidat, dbPaused }) {
        t.error(err, 'setup')
        var closing = false
        function onupdate (err, dats) {
          if (!t.ended && closing && dats.length === 0) t.ok(true, 'onupdate')
        }
        var manager = Manager({ multidat, dbPaused }, onupdate)
        manager.create(`/tmp/${Math.random()}`, function (err, dat) {
          t.error(err, 'dat created')
          closing = true
          manager.close(dat.key, function (err) {
            t.error(err, 'dat closed')
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
          t.end()
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

  t.test('.resume(dat, cb)')
  t.test('.togglePause(dat, cb)')

  t.test('finish', function (t) {
    t.end()
    process.exit()
  })
})
